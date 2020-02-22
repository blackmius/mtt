import urllib.request
from bs4 import BeautifulSoup
from collections import defaultdict
import xlrd
import re
import os

from yargy import Parser
import grammars

if not os.path.exists('sheets'):
    os.mkdir('sheets')

def download():
    page = urllib.request.urlopen('http://www.mtuci.ru/time-table/')
    soup = BeautifulSoup(page, 'html.parser')
    for link in soup.find_all('a', text=re.compile('^Расписание занятий')):
        urllib.request.urlretrieve('http://www.mtuci.ru/time-table/' + link['href'], 'sheets/' + link.text + '.xls')

subjectParser = Parser(grammars.SUBJECT)
lectorParser = Parser(grammars.LECTOR)
auditoryParser = Parser(grammars.AUDITORY)
typeParser = Parser(grammars.TYPE)

pairs = []

pairGroup = []

class IncrementedSet:
    def __init__(self):
        self._id = 0
        self._data = {}

    def __getitem__(self, key):
        if key not in self._data:
            self._data[key] = self._id
            self._id += 1
        return self._data[key]

    def reverseLookup(self):
        return {v: k for k, v in self._data.items()}

class SurnameSet(IncrementedSet):
    def __getitem__(self, key):
        if key not in self._data:
            surname = key.split()[0]
            if surname not in self._data:
                self._data[surname] = self._id
                self._id += 1
            self._data[key] = self._data[surname]
        return self._data[key]

    def reverseLookup(self):
        res = {}
        for k, v in self._data.items():
            if v not in res or len(res[v]) < len(k):
                res[v] = k
        return res

groups = IncrementedSet()
weeks = IncrementedSet()
types = IncrementedSet()
subjects = IncrementedSet()
lectors = SurnameSet()
auditories = IncrementedSet()

def parsePair(day, time, x, group, week, string):
    res = {}
    for p in pairs:
        if p['day'] == day and p['time'] == time and p['x'] == x and p['week'] == weeks[week]:
            pairGroup.append({'pair': p['id'], 'group': groups[group]})
            p['type'] = types['Лекция']
            return
    res['x'] = x
    res['id'] = len(pairs)
    res['day'] = day
    res['time'] = time
    pairGroup.append({'pair': res['id'], 'group': groups[group]})
    res['week'] = weeks[week]
    subject = subjectParser.find(string)
    if subject: res['subject'] = subjects[subject.fact.name]
    else: print(string)
    lector = lectorParser.find(string)
    if lector: res['lector'] = lectors[lector.fact.name.last + (' ' + lector.fact.name.first if lector.fact.name.first else '') + (' ' + lector.fact.name.middle if lector.fact.name.middle else '')]
    auditory = auditoryParser.find(string)
    if auditory: res['auditory'] = auditories[(auditory.fact.type or '') + str(auditory.fact.number) + (auditory.fact.art or '')]
    type_ = typeParser.find(string)
    res['type'] = types[type_.fact.name if type_ else 'Практическое занятие']
    pairs.append(res)

infcol =  ['дни', 'часы', 'группы']
skip = ['', *infcol]

ALLWAYS = 'Всегда'
EVEN = 'Верхняя'
ODD = 'Нижняя'

def parseTable(path):
    wb = xlrd.open_workbook(path, formatting_info=True)
    sh = wb.sheet_by_index(0)

    merged_cells = defaultdict(list)
    for (r0, r1, c0, c1) in sh.merged_cells:
        if r1 - r0 != 1: continue
        merged_cells[r0].append((c0, c1))

    startRow = 0
    columns = sh.row(startRow)
    while columns[0].value.lower() not in infcol:
        startRow += 1
        columns = sh.row(startRow)

    for x, cell in enumerate(columns):
        name = cell.value
        if name.lower() in skip:
            continue

        for day in range(5):
            for time in range(5):
                lines = []
                t = 0
                xx = x
                for (c0, c1) in merged_cells[startRow + 1 + day*20 + time*4]:
                    if c0 <= x < c1:
                        xx = c0
                        break
                for line in range(4):
                    lineCell = sh.cell(startRow + 1 + day*20 + time*4 + line, xx)
                    val = lineCell.value.strip()
                    lines.append(val)
                    if val != '': t += 1 << (3-line)
                xx = path+str(xx)
                if t == 0b1100: parsePair(day, time, xx, name, EVEN, lines[0] + ' ' + lines[1])
                elif t == 0b0011: parsePair(day, time, xx, name, ODD, lines[2] + ' ' + lines[3])
                elif t == 0: continue
                else:
                    # БАБКИ, СУКА, БАБКИ
                    if len(list(subjectParser.findall(' '.join(lines)))) > 1:
                        parsePair(day, time, xx, name, EVEN, lines[0] + ' ' + lines[1])
                        parsePair(day, time, xx, name, ODD, lines[2] + ' ' + lines[3])
                    else:
                        parsePair(day, time, xx, name, ALLWAYS, ' '.join(lines))
for tb in os.listdir('sheets'):
    parseTable('sheets/'+tb)

__pairs = {}
for pair in pairs:
    __pairs[pair['id']] = pair
    del pair['id']
    del pair['x']

print({
    'pairGroup': pairGroup,
    'pairs': __pairs,
    'groups': groups.reverseLookup(),
    'weeks': weeks.reverseLookup(),
    'types': types.reverseLookup(),
    'subjects': subjects.reverseLookup(),
    'lectors': lectors.reverseLookup(),
    'auditories': auditories.reverseLookup(),
    'days': { 0: 'Понедельник', 1: 'Вторник', 2: 'Среда', 3: 'Четверг', 4: 'Пятница' },
    'timestart': { 0: '9:30', 1: '11:15', 2: '13:00', 3: '15:15', 4: '16:55' },
    'timeend': { 0: '11:05', 1: '12:50', 2: '14:35', 3: '16:45', 4: '18:25' }
})

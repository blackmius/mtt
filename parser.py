import urllib.request
from bs4 import BeautifulSoup
from collections import defaultdict
import xlrd
import re
import os

import traceback

from yargy import Parser
import grammars

if not os.path.exists('sheets'):
    os.mkdir('sheets')

if len(os.listdir('sheets')) == 0:
    
    opener = urllib.request.build_opener()
    opener.addheaders = [('User-agent', 'Mozilla/5.0'), ('Referer', 'http://mtuci.ru/time-table/')]
    urllib.request.install_opener(opener)

    page = urllib.request.urlopen('http://www.mtuci.ru/time-table/')
    soup = BeautifulSoup(page, 'html.parser')
    for link in soup.find_all('a', text=re.compile('^Факультет')):
        try:
            url = 'http://www.mtuci.ru/time-table/' + urllib.parse.quote(link['href'])
            filename, headers = urllib.request.urlretrieve(url)
            realname = os.path.basename(link['href'])
            os.rename(filename, f'sheets/{realname}')
            if realname.endswith('xlsx'):
                os.system(f'libreoffice --convert-to xls "sheets/{realname}" --outdir ./sheets')
                os.remove(f'sheets/{realname}')
            print(f'Загружено {link.text}')
        except Exception as e:
            traceback.print_exc()
            

subjectParser = Parser(grammars.SUBJECT)
lectorParser = Parser(grammars.LECTOR)
auditoryParser = Parser(grammars.AUDITORY)
typeParser = Parser(grammars.TYPE)
condParser = Parser(grammars.COND)

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
    if not string.strip():
        return
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
    if lector and lector.fact.name.last:
        res['lector'] = lectors[lector.fact.name.last + (' ' + lector.fact.name.first if lector.fact.name.first else '') + (' ' + lector.fact.name.middle if lector.fact.name.middle else '')]
    auditory = auditoryParser.find(re.sub(r'\(.*\)', '', string))
    if auditory:
        res['auditory'] = auditories[(auditory.fact.type or '') + str(auditory.fact.number) + (auditory.fact.art or '')]
    type_ = typeParser.find(string)
    res['type'] = types[type_.fact.name if type_ else 'Практическое занятие']
    #cond = condParser.find(string)
    pairs.append(res)

infcol =  ['дни', 'часы', 'группы']
skip = ['', *infcol]

ALLWAYS = 'Всегда'
EVEN = 'Верхняя'
ODD = 'Нижняя'

def parseTable(path):
    print('\n', path, '\n')
    wb = xlrd.open_workbook(path, formatting_info=True)
    sheet = 0
    for sh in wb.sheets():
        sheet += 1
        
        try:
            merged_cells = defaultdict(list)
            for (r0, r1, c0, c1) in sh.merged_cells:
                if r1 - r0 != 1: continue
                merged_cells[r0].append((c0, c1))

            startRow = 0
            columns = sh.row(startRow)
            while columns[0].value.lower() not in infcol:
                startRow += 1
                columns = sh.row(startRow)
                
            skip_ = 0

            for x, cell in enumerate(columns):
                name = cell.value
                if name.lower() in skip:
                    skip_ += 1
                    continue
                    
                prefix = f'{path}{sheet}{skip_}'

                print(name)
                
                try:
                    for day in range(6):
                        for time in range(5):
                            lines = []
                            t = 0
                            
                            splited = False
                            cell = sh.cell(startRow + 1 + day*20 + time*4+1, x)
                            border = wb.xf_list[cell.xf_index].border
                            if border.bottom_line_style:
                                splited = True
                                
                            x1 = x    
                            for (c0, c1) in merged_cells[startRow + 1 + day*20 + time*4]:
                                if c0 <= x < c1:
                                    x1 = c0
                                    break
                            x2 = x
                            for (c0, c1) in merged_cells[startRow + 1 + day*20 + time*4 + 2]:
                                if c0 <= x < c1:
                                    x2 = c0
                                    break
                                
                            for line in range(4):
                                _x = x1
                                if line > 1:
                                    _x = x2
                                cell = sh.cell(startRow + 1 + day*20 + time*4 + line, _x)
                                val = str(cell.value).strip()
                                lines.append(val)

                            if len(lines) == 0: continue
                            elif splited:
                                parsePair(day, time, f'{prefix}{x1}', name, EVEN, lines[0] + ' ' + lines[1])
                                parsePair(day, time, f'{prefix}{x2}', name, ODD, lines[2] + ' ' + lines[3])
                            else:
                                parsePair(day, time, f'{prefix}{x1}', name, ALLWAYS, ' '.join(lines))
                except IndexError:
                    pass
                except Exception as e:
                    traceback.print_exc()
        except Exception as e:
            pass
                    
for tb in os.listdir('sheets'):
    try:
        parseTable('sheets/'+tb)
    except Exception as e:
        traceback.print_exc()

__pairs = {}
for pair in pairs:
    __pairs[pair['id']] = pair
    del pair['id']
    del pair['x']

import json

with open('client/src/data.json', 'w') as f:
    f.write(json.dumps({
        'pairGroup': pairGroup,
        'pairs': __pairs,
        'groups': groups.reverseLookup(),
        'weeks': weeks.reverseLookup(),
        'types': types.reverseLookup(),
        'subjects': subjects.reverseLookup(),
        'lectors': lectors.reverseLookup(),
        'auditories': auditories.reverseLookup(),
        'days': { 0: 'Понедельник', 1: 'Вторник', 2: 'Среда', 3: 'Четверг', 4: 'Пятница', 5: 'Суббота' },
        'timestart': { 0: '9:30', 1: '11:20', 2: '13:10', 3: '15:25', 4: '17:15' },
        'timeend': { 0: '11:05', 1: '12:55', 2: '14:45', 3: '17:00', 4: '18:50' }
    }))

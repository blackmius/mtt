import './style.css'

import { z, page } from './2ombular';
import data from './data.json';

import moment from './moment';

const Titled = (name, ...c) => z.v(z.l1.c2.uc(name), c);

const Back = z._a.l2({ href: '#' }, 'На главную');
const ChangeWeek = week => z.l2.sp1('Cейчас ',
    z._a.cp.h({
        href: page.link(null, {'n': page.args.n === '' ? undefined : '' })
    }, ['Верхняя', 'Нижняя'][week % 2]),
    ' неделя');

const days = [0,1,2,3,4,5];

const startMonth = 1; // Feb

const Group = _=> {
    const id = Number(page.args.id);
    const start = moment().add(2, 'day').startOf('isoWeek').add((page.args.n === '' ? 7 : 0), 'day');
    const week = Math.abs(start.week() - moment(new Date(start.year(), startMonth)).week());
    const pairs = data.pairGroup.filter(
        ({pair, group}) => group === id && (data.weeks[data.pairs[pair].week] === 'Всегда' || data.weeks[data.pairs[pair].week] ===  ['Верхняя', 'Нижняя'][week % 2])
    ).map(({pair}) => pair);
    return z._(
        Back, z.sp1,
        z.l4.b(data.groups[id]),
        ChangeWeek(week),
        z.g.gp1(days.map(d => {
            const ppairs = pairs.filter(p => data.pairs[p].day === d).sort((a, b) => data.pairs[a].time - data.pairs[b].time);
            const day = start.format('dddd, D MMMM');
            start.add(1, 'day');
            return ppairs.length
                ? z.sp3(
                    z.l2.c2.cc(day),
                    ppairs.map(p => z._a.g.nw.sp2(
                        { href: page.link('pair', { id: p }) },
                        z.sz05(Titled('Время', z.l2(data.timestart[data.pairs[p].time]))),
                        z.v(
                            Titled(data.types[data.pairs[p].type], z.l2.b(data.subjects[data.pairs[p].subject])),
                            z.g(
                                data.pairs[p].auditory !== undefined ? z.sp1(Titled('Аудитория', z.l2.sz1(data.auditories[data.pairs[p].auditory]))) : '',
                                data.pairs[p].lector !== undefined ? z.sp1(Titled('Преподаватель', z.l2.sz2(data.lectors[data.pairs[p].lector]))) : ''
                            )
                        ),
                    ))
                ) : ''
        }))
    )
};

const Pair = _ => {
    const id = Number(page.args.id);
    const pair = data.pairs[id];
    const groups = Object.values(data.pairGroup).filter(({pair}) => pair === id);
    const periodity = data.weeks[pair.week]
    return z._(
        z.l2.c2.uc(data.types[pair.type]), z.l4.b(data.subjects[pair.subject]),
        z.sp3(),
        z.g(Titled('День недели', z.l2.cc(moment.weekdays()[pair.day+1])), Titled('Периодичность', z.l2(periodity))),
        z.sp2(),
        z.g(Titled('Начало', z.l2(data.timestart[pair.time])), Titled('Конец', z.l2(data.timeend[pair.time]))),
        z.g(
            pair.auditory !== undefined ? z.sp1(Titled('Аудитория', z.l2.sz1(z._a.h({href: page.link('auditory', { id: pair.auditory })}, data.auditories[pair.auditory])))) : '',
            pair.lector !== undefined ? z.sp1(Titled('Преподаватель', z.l2.sz2(z._a.h({href: page.link('lector', { id: pair.lector })}, data.lectors[pair.lector])))) : ''
        ),
        z.sp2(),
        z.g(
            Titled(groups.length > 1 ? 'Группы' : 'Группа',
                z._a.h.l2({href: page.link('group', { id: groups[0].group })}, data.groups[groups[0].group])),         
            groups.slice(1).map(
                ({group}) => z.v.sp1(z._a.h.l2({href: page.link('group', { id: group })}, data.groups[group]))))
        
    );
};

const Teacher = _ => {
    const id = Number(page.args.id);
    const start = moment().add(2, 'day').startOf('isoWeek').add((page.args.n === '' ? 7 : 0), 'day');
    const week = Math.abs(start.week() - moment(new Date(start.year(), startMonth)).week());
    const pairs = Object.entries(data.pairs).filter(
        ([pair, {lector}]) => lector === id && (data.weeks[data.pairs[Number(pair)].week] === 'Всегда' || data.weeks[data.pairs[Number(pair)].week] ===  ['Верхняя', 'Нижняя'][week % 2])
    ).map(([pair]) => Number(pair));
    return z._(
        Back, z.sp1,
        z.l4.b(data.lectors[id]),
        ChangeWeek(week),
        z.g.gp1(days.map(d => {
            const ppairs = pairs.filter((pair) => data.pairs[pair].day === d).sort((a, b) => data.pairs[a].time - data.pairs[b].time);
            const day = start.format('dddd, D MMMM');
            start.add(1, 'day');
            return ppairs.length
                ? z.sp3(
                    z.l2.c2.cc(day),
                    ppairs.map((pair) => {
                        const groups = Object.values(data.pairGroup).filter(p => p.pair === pair);
                        return z._a.g.nw.sp2(
                            { href: page.link('pair', { id: pair }) },
                            z.sz05(Titled('Время', z.l2(data.timestart[data.pairs[pair].time]))),
                            z.v(
                                Titled(data.types[data.pairs[pair].type], z.l2.b(data.subjects[data.pairs[pair].subject])),
                                z.g(                            
                                    data.pairs[pair].auditory !== undefined ? z.sp1(Titled('Аудитория', z.l2.sz1(data.auditories[data.pairs[pair].auditory]))) : '',
                                    z.sp1(Titled(groups.length > 1 ? 'Группы' : 'Группа', z.g.sz2(groups.map(({group}) => z.v(z.l2(data.groups[group]))))))
                                )
                            ),
                        )
})
                ) : ''
        }))
    )
};

const Auditory = _ => {
    const id = Number(page.args.id);
    const start = moment().add(2, 'day').startOf('isoWeek').add((page.args.n === '' ? 7 : 0), 'day');
    const week = Math.abs(start.week() - moment(new Date(start.year(), startMonth)).week());
    const pairs = Object.entries(data.pairs).filter(
        ([pair, {auditory}]) => auditory === id && (data.weeks[data.pairs[Number(pair)].week] === 'Всегда' || data.weeks[data.pairs[Number(pair)].week] ===  ['Верхняя', 'Нижняя'][week % 2])
    ).map(([pair]) => Number(pair));
    return z._(
        Back, z.sp1,
        z.l4.b('Аудитория ' + data.auditories[id]),
        ChangeWeek(week),
        z.g.gp1(days.map(d => {
            const ppairs = pairs.filter((pair) => data.pairs[pair].day === d).sort((a, b) => data.pairs[a].time - data.pairs[b].time);;
            const day = start.format('dddd, D MMMM');
            start.add(1, 'day');
            return ppairs.length
                ? z.sp3(
                    z.l2.c2.cc(day),
                    ppairs.map((pair) => {
                        const groups = Object.values(data.pairGroup).filter(p => p.pair === pair);
                        return z._a.g.nw.sp2(
                            { href: page.link('pair', { id: pair }) },
                            z.sz05(Titled('Время', z.l2(data.timestart[data.pairs[pair].time]))),
                            z.v(
                                Titled(data.types[data.pairs[pair].type], z.l2.b(data.subjects[data.pairs[pair].subject])),
                                z.g(                            
                                    data.pairs[pair].lector !== undefined ? z.sp1(Titled('Преподаватель', z.l2.sz2(data.lectors[data.pairs[pair].lector]))) : '',
                                    z.sp1(Titled(groups.length > 1 ? 'Группы' : 'Группа', z.g.sz2(groups.map(({group}) => z.v(z.l2(data.groups[group]))))))
                                )
                            ),
                        )
})
                ) : ''
        }))
    )
};

let v = '';

const LastSearch = _ => {
    const last = JSON.parse(localStorage.timetableLastResult || '[]').filter(([cat, id]) => cat in data && id in data[cat]);
    return last.length
        ? Titled('Предыдущие результаты поиска',
            last.map(([cat, id]) => z.v(z._a.l2({ href: page.link({
                'auditories': 'auditory',
                'lectors': 'lector',
                'groups': 'group'
            }[cat], { id })}, data[cat][id])))
        ) : ''
};

function addSearchHistory(cat, id, name) {
    const inst = [cat, id];
    const history = JSON.parse(localStorage.timetableLastResult || '[]').filter(([cat, id]) => cat in data && id in data[cat]);
    v = '';
    if (history.some(([ccat, iid]) => ccat === cat & iid === id)) return;
    localStorage.timetableLastResult = JSON.stringify([inst].concat(history.slice(0, 4)));
}

const SearchResult = _ => {
    const f = v.toLowerCase();
    const groups = Object.entries(data.groups).filter(([id, name])=>name.toLowerCase().includes(f));
    const teachers = Object.entries(data.lectors).filter(([id, name])=>name.toLowerCase().includes(f));
    const auditories = Object.entries(data.auditories).filter(([id, name])=>name.toLowerCase().includes(f));
    return z._(
        groups.length
            ? Titled('Группы', groups.map(([id, name]) => z.v(z._a.l2({
                href: page.link('group', { id }),
                onclick(e) { addSearchHistory('groups', id); }
            }, name))))
            : '',
        teachers.length
            ? z.sp1(Titled('Преподаватели', teachers.map(([id, name]) => z.v(z._a.l2({
                href: page.link('lector', { id }),
                onclick(e) { addSearchHistory('lectors', id); }
            }, name)))))
            : '',
        auditories.length
            ? z.sp1(Titled('Аудитории', auditories.map(([id, name]) => z.v(z._a.l2({
                href: page.link('auditory', { id }),
                onclick(e) { addSearchHistory('auditories', id); }
            }, name)))))
            : ''
    )
};

let input, bt;
function setBT() {
    bt = !(localStorage.bt === 'true');
    localStorage.bt = bt;
    page.update();
}
setBT();
setBT();

const Search = z.g.jc(z.sz9(
    z.l4.b('Поиск'),
    z.sp1(),
    z._svg.cp({viewBox:'0 0 1000 1000', style: 'position: fixed; top: 30px; left: 30px; width: 24px; height: 24px; fill: var(--c1)', onclick: setBT},
        z._path({d:'M525.3,989.5C241.2,989.5,10,758.3,10,474.1c0-196.8,109.6-373.6,285.9-461.4c7.9-3.9,17.5-2.4,23.7,3.8c6.2,6.2,7.9,15.8,4,23.7c-32.2,65.4-48.5,135.7-48.5,208.9c0,261.4,212.7,474.1,474.1,474.1c74,0,145-16.7,211-49.5c7.9-3.9,17.5-2.4,23.7,3.8c6.3,6.3,7.9,15.8,3.9,23.7C900.5,879,723.3,989.5,525.3,989.5z'})
    ),
    z.v({ onclick: e=>input.focus() },
        z.pr.ib(
            _ => z.h1.l2.text({ class: { c0: v.length === 0 }}, v || 'Группа, преподаватель или аудитория'),
            z._input.l2.pa.fw({
                on$created(e) { input = e.target; },
                oninput(e) { v = e.target.value; page.update(); },
                value: _=> v,
                placeholder: 'Группа, преподаватель или аудитория'
            }))),
    z.sp2(),
    _ => v.trim() === ''
        ? LastSearch
        : SearchResult
));

const Main = z.main(
    _ => page.route === 'pair'
            ? Pair
        : page.route === 'group'
            ? Group
        : page.route === 'lector'
            ? Teacher
        : page.route === 'auditory'
            ? Auditory
        : Search
);

const Body = z.ov.ys.bg1.c1({class: _=>({bt})}, Main);

page.setBody(Body);

import './style.css'

import { z, page } from './2ombular';
import data from './data';

import moment from './moment';

const Titled = (name, ...c) => z.v(z.l1.c2.uc(name), c);

const Back = z._a.l2({ href: '#' }, 'На главную');

const Group = _=> {
    const id = Number(page.args.id);
    const start = moment().startOf('isoWeek');
    const week = start.week() - moment(new Date(start.year(), 8)).week();
    const pairs = data.pairGroup.filter(
        ({pair, group}) => group === id && (data.weeks[data.pairs[pair].week] === 'Всегда' || data.weeks[data.pairs[pair].week] ===  ['Верхняя', 'Нижняя'][week % 2])
    ).map(({pair}) => pair);
    return z._(
        Back, z.sp1,
        z.l4.b(data.groups[id]),
        z.g.gp1([0,1,2,3,4].map(d => {
            const ppairs = pairs.filter(p => data.pairs[p].day === d);
            const day = start.format('dddd, D MMMM');
            start.add(1, 'day');
            return ppairs.length
                ? z.sp3(
                    z.l2.c2.cc(day),
                    ppairs.map(p => z._a.g.nw.sp2(
                        { href: page.link('pair', { id: p }) },
                        Titled('Время', z.l2(data.timestart[data.pairs[p].time])),
                        z.v(
                            Titled(data.types[data.pairs[p].type], z.l2.b(data.subjects[data.pairs[p].subject])),
                            z.g(
                                data.pairs[p].auditory ? z.sp1(Titled('Аудитория', z.l2.sz1(data.auditories[data.pairs[p].auditory]))) : '',
                                data.pairs[p].lector ? z.sp1(Titled('Преподаватель', z.l2.sz2(data.lectors[data.pairs[p].lector]))) : ''
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
            pair.auditory ? z.sp1(Titled('Аудитория', z.l2.sz1(z._a.h({href: page.link('auditory', { id: pair.auditory })}, data.auditories[pair.auditory])))) : '',
            pair.lector ? z.sp1(Titled('Преподаватель', z.l2.sz2(z._a.h({href: page.link('lector', { id: pair.lector })}, data.lectors[pair.lector])))) : ''
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
    const start = moment().startOf('isoWeek');
    const week = start.week() - moment(new Date(start.year(), 8)).week();
    const pairs = Object.entries(data.pairs).filter(
        ([pair, {lector}]) => lector === id && (data.weeks[data.pairs[Number(pair)].week] === 'Всегда' || data.weeks[data.pairs[Number(pair)].week] ===  ['Верхняя', 'Нижняя'][week % 2])
    ).map(([pair]) => Number(pair));
    return z._(
        Back, z.sp1,
        z.l4.b(data.lectors[id]),
        z.g.gp1([0,1,2,3,4].map(d => {
            const ppairs = pairs.filter((pair) => data.pairs[pair].day === d);
            const day = start.format('dddd, D MMMM');
            start.add(1, 'day');
            return ppairs.length
                ? z.sp3(
                    z.l2.c2.cc(day),
                    ppairs.map((pair) => {
                        const groups = Object.values(data.pairGroup).filter(p => p.pair === pair);
                        return z._a.g.nw.sp2(
                            { href: page.link('pair', { id: pair }) },
                            Titled('Время', z.l2(data.timestart[data.pairs[pair].time])),
                            z.v(
                                Titled(data.types[data.pairs[pair].type], z.l2.b(data.subjects[data.pairs[pair].subject])),
                                z.g(                            
                                    data.pairs[pair].auditory ? z.sp1(Titled('Аудитория', z.l2.sz1(data.auditories[data.pairs[pair].auditory]))) : '',
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
    const start = moment().startOf('isoWeek');
    const week = start.week() - moment(new Date(start.year(), 8)).week();
    const pairs = Object.entries(data.pairs).filter(
        ([pair, {auditory}]) => auditory === id && (data.weeks[data.pairs[Number(pair)].week] === 'Всегда' || data.weeks[data.pairs[Number(pair)].week] ===  ['Верхняя', 'Нижняя'][week % 2])
    ).map(([pair]) => Number(pair));
    return z._(
        Back, z.sp1,
        z.l4.b('Аудитория ' + data.auditories[id]),
        z.g.gp1([0,1,2,3,4].map(d => {
            const ppairs = pairs.filter((pair) => data.pairs[pair].day === d);
            const day = start.format('dddd, D MMMM');
            start.add(1, 'day');
            return ppairs.length
                ? z.sp3(
                    z.l2.c2.cc(day),
                    ppairs.map((pair) => {
                        const groups = Object.values(data.pairGroup).filter(p => p.pair === pair);
                        return z._a.g.nw.sp2(
                            { href: page.link('pair', { id: pair }) },
                            Titled('Время', z.l2(data.timestart[data.pairs[pair].time])),
                            z.v(
                                Titled(data.types[data.pairs[pair].type], z.l2.b(data.subjects[data.pairs[pair].subject])),
                                z.g(                            
                                    data.pairs[pair].lector ? z.sp1(Titled('Преподаватель', z.l2.sz2(data.lectors[data.pairs[pair].lector]))) : '',
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
    const last = JSON.parse(localStorage.timetableLastResult || '[]');
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
    const history = JSON.parse(localStorage.timetableLastResult || '[]');
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

let input;

const Search = z.g.jc(z.sz9(
    z.l4.b('Поиск'),
    z.sp1(),
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

const Body = z.ov.ys.bg1.c1(Main);

page.setBody(Body);
from yargy.interpretation import fact, attribute
from yargy.pipelines import caseless_pipeline

Type = fact(
    'Type',
    [attribute('name', 'Практическое занятие')]
)

TYPES = {
    'лаб': 'Лабораторная',
    'лаб.': 'Лабораторная',
    'пр.з.': 'Практическое занятие',
    'пр. з.': 'Практическое занятие',
    'лек.': 'Лекция',
    'лек': 'Лекция',
    'лекц.': 'Лекция',
    'лекции': 'Лекция'
}

TYPE = caseless_pipeline(TYPES).interpretation(
    Type.name.custom(TYPES.get)
).interpretation(
    Type
)

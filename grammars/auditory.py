from yargy import rule
from yargy.interpretation import fact
from yargy.predicates import eq, dictionary, type

INT = type('INT')
DOT = eq('.')
DASH = eq('-')

Auditory = fact(
    'Auditory',
    ['type', 'number', 'art']
)

ART = rule(
    dictionary({
        'а', 'б'
    })
).interpretation(
    Auditory.art
)

TYPE = rule(
    dictionary({
        'улк',
        'л',
        'а',
        'вц',
        'авиамоторная',
        'спортзал',
        'дистанционно'
    }),
).interpretation(
    Auditory.type
)

NUMBER = rule(
    INT
).interpretation(
    Auditory.number.custom(int)
)

AUDITORY = rule(
    eq('ауд').optional(),
    DOT.optional(),
    TYPE.optional(),
    DASH.optional(),
    NUMBER,
    ART.optional()
).interpretation(
    Auditory
)

from yargy import rule, or_
from yargy.interpretation import fact, attribute
from yargy.predicates import eq, type

Cond = fact(
    'Cond',
    [attribute('weeks').repeatable(), 'type']
)

INT = type('INT')
COMMA = eq(',')
DASH = eq('-')
DOT = eq('.')

NUM = rule(INT)

RANGE = rule(
    INT,
    DASH,
    INT
)

NUMBER = rule(
    or_(
        NUM,
        RANGE
    ),
    COMMA.optional()
)

COND = rule(
    eq('(').optional(),
    NUMBER.repeatable(),
    eq('нед'),
    DOT.optional(),
    eq(')').optional()
)

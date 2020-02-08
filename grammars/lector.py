from yargy import (
    rule,
    or_, and_
)

from yargy.interpretation import fact, attribute
from yargy.predicates import (
    eq, length_eq, dictionary,
    gram, is_capitalized, type
)

from yargy.pipelines import caseless_pipeline

from yargy.predicates.constructors import ParameterPredicate

class length_grt(ParameterPredicate):
    """len(a) > b
    >>> predicate = length_grt(3)
    >>> a, b = tokenize('XXXX 123')
    >>> predicate(a)
    True
    >>> predicate(b)
    FALSE
    """

    def __call__(self, token):
        return len(token.value) > self.value

Lector = fact(
    'Lector',
    ['name', 'degree']
)

Name = fact(
    'Name',
    [attribute('first', ''), attribute('middle', ''), attribute('last', '')]
)

DOT = eq('.')

LAST = and_(
    type('RU'),
    is_capitalized(),
    length_grt(1)
).interpretation(
    Name.last.custom(str.capitalize)
)

FIRST = and_(
    gram('Name'),
    length_grt(1)
).interpretation(
    Name.first.custom(str.capitalize)
)

MIDDLE = and_(
    gram('Patr'),
    length_grt(1)
).interpretation(
    Name.middle.custom(str.capitalize)
)
ABBR = and_(
    length_eq(1),
    is_capitalized()
)

FIRST_ABBR = ABBR.interpretation(
    Name.first.custom(str.upper)
)

MIDDLE_ABBR = ABBR.interpretation(
    Name.middle.custom(str.upper)
)

unsubstantial = {
    'Бен Режеб Т.Б.К.'
}

UNSUBSTANIAL = caseless_pipeline(unsubstantial).interpretation(
    Name
)

NAME = or_(
    rule(
        UNSUBSTANIAL
    ),
    rule(
        LAST, DOT,
        FIRST_ABBR, DOT,
        MIDDLE_ABBR, DOT
    ),
    rule(
        LAST,
        FIRST_ABBR, DOT,
        MIDDLE_ABBR, DOT
    ),
    rule(
        FIRST_ABBR, DOT,
        MIDDLE_ABBR, DOT,
        LAST
    ),
    rule(
        LAST,
        FIRST_ABBR, DOT
    ),
    rule(
        FIRST_ABBR, DOT,
        LAST
    ),
    rule(
        FIRST,
        MIDDLE,
        LAST
    ),
    rule(
        LAST,
        FIRST,
        MIDDLE
    ),
    rule(
        FIRST,
        MIDDLE
    ),
).interpretation(
    Name
)
"""
degrees = {
    'ст.преп.': 'старший перподаватель',
    'ст.пр.': 'старший перподаватель',
    'доц.': 'доцент',
    'проф.': 'профессор',
    'асс.': 'ассистент'
}

DEGREE = caseless_pipeline(degrees).interpretation(
    Lector.degree.normalized().custom(degrees.get)
)
"""
LECTOR = rule(
    #DEGREE.optional(),
    NAME.interpretation(
        Lector.name
    )
).interpretation(
    Lector
)

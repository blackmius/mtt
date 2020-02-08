from yargy import rule
from yargy.interpretation import fact
from yargy.predicates import eq, dictionary, type
from yargy.pipelines import caseless_pipeline
import os

Subject = fact(
    'Subject',
    ['name']
)

subjectsPath = os.path.join(os.path.dirname(__file__), 'subjects')

subjects = {}
for subj in set(open(subjectsPath, 'r').read().strip().split('\n')) - {''}:
    a = subj.split('\\')
    if len(a) == 2: subjects[a[0]] = a[1].strip().lower()
    else: subjects[subj] = subj.lower()

if __name__ == '__main__':
    while True:
        s = input().lower()
        for i in subjects:
            i = i.lower()
            l = i.split()
            if len(l) == len(s) and all([s[i] == l[i][0] for i in range(len(s))]): print(i)

SUBJECT = rule(
    caseless_pipeline(subjects).interpretation(
        Subject.name.normalized().custom(subjects.get)
    )
).interpretation(
    Subject
)

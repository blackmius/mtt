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
for subj in set(open(subjectsPath, 'r').read().lower().strip().split('\n')) - {''}:
    subj = subj.strip()
    a = subj.split('\\')
    if len(a) == 2:
        subj = a[1].strip()
        subjects[a[0].strip()] = subj
    subjects[subj] = subj

if __name__ == '__main__':
    """
    while True:
        s = input().lower()
        for i in subjects:
            i = i.lower()
            l = i.split()
            if len(l) == len(s) and all([s[i] == l[i][0] for i in range(len(s))]): print(i)
    """    
    for i in subjects:
        if i == subjects[i]: print(i)
        else: print(i, '\\', subjects[i])
    
SUBJECT = rule(
    caseless_pipeline(subjects).interpretation(
        Subject.name.normalized().custom(subjects.get)
    )
).interpretation(
    Subject
)

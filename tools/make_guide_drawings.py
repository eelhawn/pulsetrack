#!/usr/bin/env python3
"""Draws PulseTrack's own line drawings for the exercise guides (img/ex/*.svg) from joint positions, side view, facing right.

    python3 tools/make_guide_drawings.py

Original work made for PulseTrack (licence "original", author "PulseTrack" in exercise-guides.js), no photos, nothing traced.
The movement arrows are NOT drawn here: they are data in exercise-guides.js, drawn over the picture by the app, so they can be moved.
Every drawing is 320 x 240 (4:3) on a dark card, so arrows given as fractions of the picture land in the same place on a photo.
"""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'img', 'ex')
W, H, FLOOR = 320, 240, 210
BODY, KIT, KIT_FILL, PLATE = '#e4e4e7', '#8f8f99', '#3f3f46', '#a1a1aa'


def line(p, q, color=BODY, w=9):
    return '<line x1="%g" y1="%g" x2="%g" y2="%g" stroke="%s" stroke-width="%g" stroke-linecap="round"/>' % (p[0], p[1], q[0], q[1], color, w)


def poly(pts, color=BODY, w=9):
    return '<polyline points="%s" fill="none" stroke="%s" stroke-width="%g" stroke-linecap="round" stroke-linejoin="round"/>' % (' '.join('%g,%g' % p for p in pts), color, w)


def rect(x, y, w, h, r=3, fill=KIT_FILL, stroke=KIT):
    return '<rect x="%g" y="%g" width="%g" height="%g" rx="%g" fill="%s" stroke="%s" stroke-width="2"/>' % (x, y, w, h, r, fill, stroke)


def plate(c, r=17):
    return '<circle cx="%g" cy="%g" r="%g" fill="#52525b" stroke="%s" stroke-width="3"/><circle cx="%g" cy="%g" r="3" fill="%s"/>' % (c[0], c[1], r, PLATE, c[0], c[1], PLATE)


def person(j, face_r=13, arm_in_front=False):
    """j: head, shoulder, hip, knee, ankle, toe, elbow, hand (the near arm and leg; the far side hides behind).
    arm_in_front: the arm is drawn over the head (arms raised past the face)"""
    s = poly([j['ankle'], j['knee'], j['hip']], w=11) + line(j['ankle'], j['toe'], w=8)
    s += line(j['hip'], j['shoulder'], w=14)
    arm = poly([j['shoulder'], j['elbow'], j['hand']], w=9)
    head = '<circle cx="%g" cy="%g" r="%g" fill="%s" stroke="#18181b" stroke-width="2.5"/>' % (j['head'][0], j['head'][1], face_r, BODY)
    return s + (head + arm if arm_in_front else arm + head)


def svg(title, *parts, floor=True):
    body = ''.join(parts)
    fl = '<line x1="16" y1="%d" x2="%d" y2="%d" stroke="#3f3f46" stroke-width="3" stroke-linecap="round"/>' % (FLOOR, W - 16, FLOOR) if floor else ''
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" width="%d" height="%d" role="img" aria-label="%s">'
            '<title>%s. Drawing: PulseTrack, original work.</title><rect width="%d" height="%d" rx="14" fill="#18181b"/>%s%s</svg>\n'
            % (W, H, W, H, title, title, W, H, fl, body))


D = {}

# ---- Bench Press: lying on a flat bench, bar over the shoulders, then at the mid-chest
bench = rect(55, 150, 200, 12) + line((78, 162), (78, FLOOR), KIT, 6) + line((232, 162), (232, FLOOR), KIT, 6) + line((96, 150), (96, 58), KIT, 5) + line((88, 60), (104, 60), KIT, 5)
lying = dict(head=(84, 134), shoulder=(112, 141), hip=(205, 143), knee=(250, 150), ankle=(246, FLOOR - 3), toe=(264, FLOOR - 1))
D['bench-press-1'] = svg('Bench press: arms straight, bar over the shoulders', bench, person(dict(lying, elbow=(116, 104), hand=(120, 72))), plate((120, 66)))
D['bench-press-2'] = svg('Bench press: bar lowered to the mid-chest', bench, person(dict(lying, elbow=(126, 154), hand=(136, 122))), plate((137, 114)))

# ---- Squat: standing with the bar on the upper back, then thighs about parallel
rack = line((120, FLOOR), (120, 40), KIT, 5) + line((112, 64), (128, 64), KIT, 5)
D['squat-1'] = svg('Squat: standing tall, bar on the upper back', rack, plate((163, 63)), person(dict(head=(180, 40), shoulder=(172, 66), hip=(168, 116), knee=(172, 162), ankle=(170, FLOOR - 3), toe=(192, FLOOR - 1), elbow=(150, 84), hand=(161, 64))))
D['squat-2'] = svg('Squat: hips down and back, thighs about parallel', rack, plate((172, 104)), person(dict(head=(198, 88), shoulder=(184, 110), hip=(146, 160), knee=(200, 166), ankle=(170, FLOOR - 3), toe=(192, FLOOR - 1), elbow=(160, 128), hand=(170, 106))))

# ---- Romanian deadlift: standing with the bar at the thighs, then hips pushed back with a flat back
D['romanian-deadlift-1'] = svg('Romanian deadlift: standing, bar at the thighs', person(dict(head=(178, 40), shoulder=(172, 66), hip=(168, 116), knee=(171, 162), ankle=(170, FLOOR - 3), toe=(192, FLOOR - 1), elbow=(174, 96), hand=(177, 124))), plate((178, 128), 15))
D['romanian-deadlift-2'] = svg('Romanian deadlift: hips back, flat back, bar below the knees', person(dict(head=(220, 84), shoulder=(200, 96), hip=(136, 122), knee=(176, 164), ankle=(170, FLOOR - 3), toe=(192, FLOOR - 1), elbow=(199, 131), hand=(197, 164))), plate((196, 170), 15))

# ---- Lat pulldown: seated under the thigh pad, arms up, then the bar at the upper chest
machine = line((60, FLOOR), (60, 12), KIT, 7) + line((60, 14), (165, 14), KIT, 6) + '<circle cx="160" cy="18" r="7" fill="%s" stroke="%s" stroke-width="2"/>' % (KIT_FILL, KIT)
seat = rect(118, 148, 66, 10) + line((150, 158), (150, FLOOR), KIT, 6) + rect(188, 118, 30, 9)
sit = dict(head=(146, 62), shoulder=(140, 86), hip=(150, 144), knee=(201, 138), ankle=(206, FLOOR - 3), toe=(224, FLOOR - 1))
D['lat-pulldown-1'] = svg('Lat pulldown: seated, arms straight up on the bar', machine, seat, line((160, 24), (160, 30), PLATE, 2), person(dict(sit, elbow=(154, 58), hand=(158, 32)), arm_in_front=True), '<circle cx="159" cy="31" r="6" fill="%s"/>' % PLATE)
D['lat-pulldown-2'] = svg('Lat pulldown: bar pulled to the upper chest, elbows down', machine, seat, line((160, 24), (161, 78), PLATE, 2), person(dict(sit, elbow=(136, 114), hand=(160, 82)), arm_in_front=True), '<circle cx="161" cy="80" r="6" fill="%s"/>' % PLATE)

# ---- Seated cable row: feet on the platform, arms long, then the handle at the lower ribs
row_kit = rect(286, 36, 16, FLOOR - 36, 4) + '<circle cx="286" cy="150" r="7" fill="%s" stroke="%s" stroke-width="2"/>' % (KIT_FILL, KIT) + rect(96, 170, 108, 9) + line((150, 179), (150, FLOOR), KIT, 6) + line((246, FLOOR), (258, 166), KIT, 7)
row = dict(head=(152, 78), shoulder=(146, 102), hip=(140, 166), knee=(206, 146), ankle=(251, 182), toe=(258, 168))
D['seated-cable-row-1'] = svg('Seated cable row: sitting tall, arms reaching forward', row_kit, line((226, 130), (286, 150), PLATE, 2), person(dict(row, elbow=(186, 116), hand=(222, 129))), rect(220, 124, 12, 12, 3, PLATE, PLATE))
D['seated-cable-row-2'] = svg('Seated cable row: handle at the lower ribs, elbows back', row_kit, line((176, 130), (286, 150), PLATE, 2), person(dict(row, elbow=(124, 122), hand=(170, 129))), rect(168, 124, 12, 12, 3, PLATE, PLATE))

# ---- Push-ups: high plank, then chest about a fist from the floor
D['push-ups-1'] = svg('Push-up: high plank, body in a straight line', person(dict(head=(250, 132), shoulder=(228, 146), hip=(150, 172), knee=(110, 186), ankle=(70, 200), toe=(60, FLOOR - 1), elbow=(229, 176), hand=(230, FLOOR - 3))))
D['push-ups-2'] = svg('Push-up: lowered, chest near the floor, elbows about 45 degrees', person(dict(head=(246, 180), shoulder=(222, 188), hip=(146, 194), knee=(108, 198), ankle=(70, 201), toe=(60, FLOOR - 1), elbow=(196, 168), hand=(220, FLOOR - 3))))


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    for k, v in D.items():
        open(os.path.join(OUT, k + '.svg'), 'w', encoding='utf-8').write(v)
    print('wrote %d drawings to img/ex/' % len(D))

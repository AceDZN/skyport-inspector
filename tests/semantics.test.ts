import test from 'node:test';
import assert from 'node:assert/strict';
import { allCases, cases, pairedCases, evaluate, expectedAction, resolveJourney, type Case, type Attempt } from '../src/content.ts';

const get = (id: string) => allCases.find(item => item.id === id)!;
const solution = (item: Case): Attempt => ({ ...item.expected, evidence: item.evidencePairs[0]!, clarified: !!item.question });

test('all grades have authored guided, independent and changed-context transfer paths', () => {
  assert.equal(cases.length, 9);
  for (const grade of [7, 8, 9]) {
    const pack = cases.filter(item => item.grade === grade);
    assert.deepEqual(pack.map(item => item.stage), ['guided', 'independent', 'transfer']);
    assert.equal(new Set(pack.map(item => item.passenger)).size, 3);
    assert.ok(pack.every(item => item.documents.length >= 2));
  }
});

for (const item of allCases) {
  test(`${item.id}: source-supported action is solvable`, () => {
    assert.deepEqual(item.expected, expectedAction(item.world));
    const outcome = evaluate(item, solution(item));
    assert.equal(outcome.correct, true);
    assert.equal(outcome.comprehension, true);
    assert.equal(outcome.needsClarification, false);
  });
  test(`${item.id}: opposite stamp cannot earn comprehension credit`, () => {
    const attempt = solution(item);
    attempt.decision = attempt.decision === 'board' ? 'hold' : 'board';
    assert.equal(evaluate(item, attempt).correct, false);
    assert.equal(evaluate(item, attempt).comprehension, false);
  });
  test(`${item.id}: lucky stamp without a supporting pair advances without comprehension`, () => {
    const attempt = { ...solution(item), evidence: [] };
    assert.equal(evaluate(item, attempt).correct, true);
    assert.equal(evaluate(item, attempt).comprehension, false);
  });
  test(`${item.id}: all credited lines exist, question replies are gated`, () => {
    const visible = new Set(item.documents.flatMap(document => document.lines.map(phrase => phrase.id)));
    item.question?.lines.forEach(phrase => visible.add(phrase.id));
    for (const pair of item.evidencePairs) assert.ok(pair.every(id => visible.has(id)));
    assert.ok(item.sources.every(url => url.startsWith('https://english.workbook.co.il/grade-')));
  });
}

test('G7 asks for today’s missing departure, rather than guessing a habit or past journey', () => {
  const item = get('g7-2');
  for (const time of ['09:00', '16:30', '18:00']) {
    const outcome = evaluate(item, { ...solution(item), clarified: false, time });
    assert.equal(outcome.needsClarification, true);
    assert.equal(outcome.correct, false);
  }
  assert.equal(item.question?.correctChoice, 'today');
  assert.equal(evaluate(item, { ...solution(item), clarified: true, time: '09:00', gate: '2' }).correct, false);
  assert.equal(evaluate(item, solution(item)).correct, true);
});

test('G7 paired return: same visual skin, tomorrow HOLD versus today BOARD', () => {
  const base = get('g7-3'), pair = get('g7-3-pair');
  assert.equal(base.skin, pair.skin);
  assert.deepEqual(base.documents.map(document => document.id), pair.documents.map(document => document.id));
  assert.equal(base.expected.decision, 'hold');
  assert.equal(pair.expected.decision, 'board');
  assert.equal(evaluate(base, solution(pair)).correct, false);
  assert.equal(evaluate(pair, solution(base)).correct, false);
});

test('G8 same journey update: gate changes, departure is preserved', () => {
  const item = get('g8-2');
  assert.equal(item.expected.gate, '3');
  assert.equal(item.expected.time, '18:00');
  assert.equal(evaluate(item, { ...solution(item), gate: '2' }).correct, false);
  assert.equal(evaluate(item, { ...solution(item), time: '19:00' }).correct, false);
});

test('G8 paired tomorrow notice does not overwrite today’s gate', () => {
  const base = get('g8-2'), pair = get('g8-2-pair');
  assert.equal(base.skin, pair.skin);
  assert.equal(pair.expected.gate, '2');
  assert.equal(evaluate(pair, solution(base)).correct, false);
  assert.equal(evaluate(base, solution(pair)).correct, false);
});

test('G8 transfer changes time while retaining gate/destination; other journeys remain separate', () => {
  const item = get('g8-3');
  const current = resolveJourney(item.world);
  assert.equal(current.time, '19:00');
  assert.equal(current.gate, '4');
  assert.equal(current.destination, 'Harbor Lights');
  for (const mismatch of [
    { journeyId: 'OTHER', date: '27 October', destination: 'Harbor Lights' },
    { journeyId: 'HL-17', date: '28 October', destination: 'Harbor Lights' },
    { journeyId: 'HL-17', date: '27 October', destination: 'Cloud Garden' },
  ]) {
    const world = { ...item.world, updates: [{ ...mismatch, changes: { time: '09:00', gate: '2' as const } }] };
    assert.equal(resolveJourney(world).time, '17:00');
    assert.equal(resolveJourney(world).gate, '4');
  }
});

test('G9 current record, not a past check-in or the mere word has, determines boarding', () => {
  const ready = get('g9-1'), notReady = get('g9-1-pair');
  assert.equal(ready.skin, notReady.skin);
  assert.equal(ready.expected.decision, 'board');
  assert.equal(notReady.expected.decision, 'hold');
  const pastOnly = { ...ready.world, journey: { ...ready.world.journey, checkedIn: undefined } };
  assert.equal(expectedAction(pastOnly).decision, 'hold');
  // Even a valid present-perfect sentence about a DIFFERENT journey cannot create a current record.
  const unrelated = { ...pastOnly, updates: [{ journeyId: 'YESTERDAY-TOUR', date: '26 October', destination: 'Island Tour', changes: { checkedIn: true } }] };
  assert.equal(expectedAction(unrelated).decision, 'hold');
});

test('G9 reported cancellation applies to Mina, not addressee Eren or a different date', () => {
  const item = get('g9-2');
  assert.equal(item.expected.decision, 'hold');
  const erenWorld = { ...item.world, passenger: 'Eren Hale', journey: { ...item.world.journey, id: 'CG-18-EREN', holder: 'Eren Hale' } };
  assert.equal(expectedAction(erenWorld).decision, 'board');
  const nextDay = { ...item.world, date: '28 October', journey: { ...item.world.journey, date: '28 October' } };
  assert.equal(expectedAction(nextDay).decision, 'board');
});

test('G9 an isolated lost-ticket past event requires current-status clarification', () => {
  const base = get('g9-1');
  const unknown: Case = { ...base, missing: true, world: { ...base.world, unresolved: 'current-status' },
    documents: [{ id: 'event', title: 'EVENT RECORD', lines: [{ id: 'past-loss', text: 'I lost my ticket yesterday.' }] }],
    evidencePairs: [['past-loss', 'current-reply']] };
  const outcome = evaluate(unknown, { ...solution(base), clarified: false });
  assert.equal(outcome.needsClarification, true);
  assert.equal(outcome.correct, false);
});

test('G9 transfer finite evidence reason must preserve time and gate, not trust old flyer', () => {
  const item = get('g9-3');
  assert.equal(item.expected.time, '19:00');
  assert.equal(item.expected.gate, '4');
  assert.equal(evaluate(item, { ...solution(item), gate: '2' }).correct, false);
  assert.equal(evaluate(item, { ...solution(item), evidence: ['g9-3-old', 'g9-3-ticket'] }).comprehension, false);
});

test('select-all, fabricated, duplicated and irrelevant evidence cannot earn credit', () => {
  const item = get('g8-2');
  const all = item.documents.flatMap(document => document.lines.map(phrase => phrase.id));
  for (const evidence of [all, ['invented', 'g8-2-update'], ['g8-2-ticket', 'g8-2-ticket'], ['g8-2-other', 'g8-2-reference']]) {
    assert.equal(evaluate(item, { ...solution(item), evidence }).comprehension, false);
  }
});

test('hold is a queue decision: irrelevant gate/time fields do not block a valid hold', () => {
  const item = get('g7-3');
  assert.equal(evaluate(item, { ...solution(item), gate: '2', time: '09:00' }).correct, true);
});

test('all three paired variants change meaning/action while preserving document identities', () => {
  assert.equal(pairedCases.length, 3);
  assert.deepEqual(pairedCases.map(item => item.grade), [7, 8, 9]);
  for (const pair of pairedCases) {
    const base = get(pair.id.replace('-pair', ''));
    assert.equal(pair.skin, base.skin);
    assert.deepEqual(pair.documents.map(document => document.id), base.documents.map(document => document.id));
    assert.notDeepEqual(pair.expected, base.expected);
  }
});

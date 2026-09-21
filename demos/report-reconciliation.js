(() => {
  const records = [
    { id: 'DOC-101', title: 'Program guide', expected: 'v4 · Current', posted: 'v4 · Current', result: 'Match', action: 'No action' },
    { id: 'DOC-102', title: 'Registration manual', expected: 'v7 · Current', posted: 'v6 · Current', result: 'Version mismatch', action: 'Verify publication package' },
    { id: 'DOC-103', title: 'Accessibility overview', expected: 'v3 · Current', posted: null, result: 'Missing from site', action: 'Confirm whether publication is due' },
    { id: 'DOC-104', title: 'Operations handbook', expected: 'v5 · Retired', posted: 'v5 · Current', result: 'Status mismatch', action: 'Review retirement decision' },
    { id: 'DOC-105', title: 'Support reference', expected: 'v2 · Current', posted: 'v2 · Current', result: 'Match', action: 'No action' },
    { id: 'DOC-106', title: 'Administration guide', expected: 'v8 · Current', posted: 'v8 · Current', result: 'Match', action: 'No action' },
  ];

  const stages = ['salesforce', 'sharepoint', 'crawler', 'excel'];
  const buttons = Object.fromEntries(stages.map(stage => [stage, document.getElementById(`run-${stage}`)]));
  const log = document.getElementById('workflow-log');
  const state = document.getElementById('workflow-state');
  const panel = document.getElementById('comparison-panel');
  const filter = document.getElementById('comparison-filter');
  let completed = 0;

  const messages = {
    salesforce: 'Scheduled Salesforce extract received in the fictional inbox: 6 expected records.',
    sharepoint: 'Power Automate stored the attachment as the latest SharePoint report.',
    crawler: 'Python crawler completed: 5 posted records found and written to a separate workbook.',
    excel: 'Excel refresh completed: records joined by document ID and 3 exceptions flagged for review.',
  };

  function addLog(message) {
    if (completed === 0) log.replaceChildren();
    const item = document.createElement('li');
    item.textContent = message;
    log.appendChild(item);
  }

  function setStage(stage) {
    const index = stages.indexOf(stage);
    if (index !== completed) return;
    document.getElementById(`stage-${stage}`).classList.add('is-complete');
    buttons[stage].disabled = true;
    buttons[stage].classList.add('is-complete');
    addLog(messages[stage]);
    completed += 1;
    state.textContent = completed === stages.length ? 'Comparison ready' : `${completed} of ${stages.length} stages complete`;
    if (completed < stages.length) buttons[stages[completed]].disabled = false;
    if (stage === 'excel') {
      panel.hidden = false;
      renderTable();
      panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function renderTable() {
    const mode = filter.value;
    const visible = records.filter(record => mode === 'all' || (mode === 'match' ? record.result === 'Match' : record.result !== 'Match'));
    const body = document.getElementById('comparison-rows');
    body.replaceChildren();
    visible.forEach(record => {
      const row = document.createElement('tr');
      const documentCell = document.createElement('th');
      documentCell.scope = 'row';
      documentCell.innerHTML = `<strong>${record.id}</strong><span>${record.title}</span>`;
      const expected = document.createElement('td');
      expected.textContent = record.expected;
      const posted = document.createElement('td');
      posted.textContent = record.posted || 'No record found';
      const result = document.createElement('td');
      const badge = document.createElement('span');
      badge.className = `comparison-badge ${record.result === 'Match' ? 'is-match' : 'is-exception'}`;
      badge.textContent = record.result;
      result.appendChild(badge);
      const action = document.createElement('td');
      action.textContent = record.action;
      row.append(documentCell, expected, posted, result, action);
      body.appendChild(row);
    });
    document.getElementById('expected-count').textContent = String(records.length);
    document.getElementById('posted-count').textContent = String(records.filter(record => record.posted).length);
    document.getElementById('exception-count').textContent = String(records.filter(record => record.result !== 'Match').length);
  }

  function reset() {
    completed = 0;
    stages.forEach((stage, index) => {
      document.getElementById(`stage-${stage}`).classList.remove('is-complete');
      buttons[stage].classList.remove('is-complete');
      buttons[stage].disabled = index !== 0;
    });
    state.textContent = 'Ready';
    log.innerHTML = '<li>Select “Run scheduled report” to begin.</li>';
    panel.hidden = true;
    filter.value = 'all';
  }

  stages.forEach(stage => buttons[stage].addEventListener('click', () => setStage(stage)));
  filter.addEventListener('change', renderTable);
  document.getElementById('reset-reconciliation').addEventListener('click', reset);
})();

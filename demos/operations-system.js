(() => {
  const storageKey = 'tz-portfolio-operations-demo-v1';
  const changes = [
    { id: 'CHG-101', title: 'Clarify renewal reminder', area: 'Member communications', owner: 'Content operations', priority: 'Medium', release: 'Next release', status: 'In review', summary: 'A reminder needs clearer timing language across the email and support guide.', guides: ['KB-01', 'KB-02'], history: ['Review owner assigned and source wording collected.'] },
    { id: 'CHG-102', title: 'Update enrollment confirmation', area: 'Enrollment', owner: 'Program operations', priority: 'High', release: 'Next release', status: 'Requirements', summary: 'A process change affects the confirmation message and the staff handoff instructions.', guides: ['KB-01', 'KB-04'], history: ['Process owner asked to confirm the new handoff.'] },
    { id: 'CHG-103', title: 'Add help for password reset', area: 'Member portal', owner: 'Digital support', priority: 'Medium', release: 'Following release', status: 'New', summary: 'Support questions point to a gap in the self-service sign-in instructions.', guides: ['KB-01', 'KB-03'], history: ['Intake logged from the support team.'] },
    { id: 'CHG-104', title: 'Align directory terminology', area: 'Provider directory', owner: 'Content operations', priority: 'Low', release: 'Following release', status: 'Ready', summary: 'Related guides use different names for the same directory field.', guides: ['KB-02', 'KB-03'], history: ['Approved wording recorded for the next publication check.'] },
    { id: 'CHG-105', title: 'Revise exception handoff', area: 'Internal operations', owner: 'Process design', priority: 'High', release: 'Next release', status: 'In review', summary: 'A new exception path needs clear ownership, escalation, and a revised work instruction.', guides: ['KB-04', 'KB-05'], history: ['Draft work instruction sent for owner review.'] },
    { id: 'CHG-106', title: 'Refresh publication checklist', area: 'Document controls', owner: 'Quality review', priority: 'Medium', release: 'Following release', status: 'Requirements', summary: 'The release team needs one place to confirm document status before and after posting.', guides: ['KB-02', 'KB-03'], history: ['Validation questions gathered from reviewers.'] },
  ];
  const guides = [
    { id: 'KB-01', title: 'Write a change brief', topic: 'Requirements', summary: 'A concise way to turn an enhancement request into a reviewable change record.', steps: ['State the user or business problem.', 'Identify the owner and affected channels.', 'Record the proposed change and open questions.', 'Link the documents that may need an update.'], purpose: 'A clear brief reduces repeated discovery and gives reviewers the same starting point.', keywords: 'intake enhancement brief' },
    { id: 'KB-02', title: 'Review a document change', topic: 'Review', summary: 'A human review checklist for proposed wording and related content.', steps: ['Compare the proposed change with the approved source.', 'Check nearby sections for conflicting language.', 'Record the decision and unresolved questions.', 'Send the writer specific, traceable feedback.'], purpose: 'The reviewer keeps final judgment while using structured inputs to focus attention.', keywords: 'document content wording' },
    { id: 'KB-03', title: 'Validate after publication', topic: 'Quality control', summary: 'A check for status and consistency after a customer-facing update is posted.', steps: ['Confirm the intended document is live.', 'Compare posted status with the tracking record.', 'Flag mismatches for an owner to investigate.', 'Record the resolution.'], purpose: 'A final check catches potential differences between internal status and public content.', keywords: 'published status validation' },
    { id: 'KB-04', title: 'Draft a work instruction', topic: 'Process design', summary: 'A guided structure for turning process knowledge into a usable draft.', steps: ['Identify the audience and trigger for the work.', 'List the required inputs and decisions.', 'Write steps in the approved format.', 'Ask a process owner to review the draft.'], purpose: 'People can share what they know while retaining review and ownership of the final instruction.', keywords: 'sop standard operating procedure' },
    { id: 'KB-05', title: 'Set an escalation path', topic: 'Operations', summary: 'A simple pattern for assigning an issue and making follow-up visible.', steps: ['Name the decision owner.', 'Set the response window and escalation trigger.', 'Record the current status and blocker.', 'Close the loop with the next team.'], purpose: 'A visible response path helps prevent work from stalling between teams.', keywords: 'handoff owner delay' },
  ];
  const byGuideId = new Map(guides.map(guide => [guide.id, guide]));
  let localChanges = { statuses: {}, notes: {} };
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (stored && typeof stored === 'object') localChanges = { statuses: stored.statuses || {}, notes: stored.notes || {} };
  } catch { /* The demo still works when browser storage is unavailable. */ }
  let selectedChange = changes[0].id;
  let selectedGuide = guides[0].id;

  const byId = id => document.getElementById(id);
  const statusOf = change => localChanges.statuses[change.id] || change.status;
  const store = () => { try { localStorage.setItem(storageKey, JSON.stringify(localChanges)); } catch { /* In-memory edits still work. */ } };

  function renderStats() {
    byId('stat-total').textContent = String(changes.length);
    byId('stat-review').textContent = String(changes.filter(change => statusOf(change) === 'In review').length);
    byId('stat-ready').textContent = String(changes.filter(change => statusOf(change) === 'Ready').length);
  }

  function renderChangeList() {
    const search = byId('change-search').value.trim().toLowerCase();
    const filter = byId('status-filter').value;
    const visible = changes.filter(change =>
      (filter === 'all' || statusOf(change) === filter) &&
      `${change.id} ${change.title} ${change.area} ${change.owner}`.toLowerCase().includes(search)
    );
    if (!visible.some(change => change.id === selectedChange)) selectedChange = visible[0]?.id || null;
    byId('change-empty').hidden = visible.length !== 0;
    const list = byId('change-list');
    list.replaceChildren();
    visible.forEach(change => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'record-button';
      button.setAttribute('aria-pressed', String(change.id === selectedChange));
      const top = document.createElement('span');
      top.className = 'record-topline';
      const id = document.createElement('span');
      id.textContent = change.id;
      const status = document.createElement('span');
      status.textContent = statusOf(change);
      top.append(id, status);
      const title = document.createElement('strong');
      title.textContent = change.title;
      const area = document.createElement('span');
      area.className = 'record-area';
      area.textContent = change.area;
      button.append(top, title, area);
      button.addEventListener('click', () => { selectedChange = change.id; renderChangeList(); renderChangeDetail(); });
      list.appendChild(button);
    });
    renderChangeDetail();
  }

  function renderChangeDetail() {
    const panel = document.querySelector('#tracker .system-detail-panel');
    const change = changes.find(item => item.id === selectedChange);
    panel.hidden = !change;
    if (!change) return;
    byId('change-id').textContent = change.id;
    byId('change-priority').textContent = `${change.priority} priority`;
    byId('change-title').textContent = change.title;
    byId('change-summary').textContent = change.summary;
    byId('change-owner').textContent = change.owner;
    byId('change-area').textContent = change.area;
    byId('change-release').textContent = change.release;
    byId('change-status').value = statusOf(change);
    byId('decision-note').value = '';
    byId('save-message').textContent = '';

    const links = byId('linked-guides');
    links.replaceChildren();
    change.guides.forEach(id => {
      const guide = byGuideId.get(id);
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = `${id} · ${guide.title} ↗`;
      button.addEventListener('click', () => {
        selectedGuide = guide.id;
        byId('guide-search').value = '';
        renderGuides();
        byId('hub').scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      links.appendChild(button);
    });

    const history = byId('decision-history');
    history.replaceChildren();
    [...change.history, ...(localChanges.notes[change.id] || [])].forEach(note => {
      const li = document.createElement('li');
      li.textContent = note;
      history.appendChild(li);
    });
  }

  function renderGuides() {
    const search = byId('guide-search').value.trim().toLowerCase();
    const visible = guides.filter(guide => `${guide.id} ${guide.title} ${guide.topic} ${guide.summary} ${guide.keywords}`.toLowerCase().includes(search));
    if (!visible.some(guide => guide.id === selectedGuide)) selectedGuide = visible[0]?.id || null;
    byId('guide-empty').hidden = visible.length !== 0;
    const list = byId('guide-list');
    list.replaceChildren();
    visible.forEach(guide => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'record-button';
      button.setAttribute('aria-pressed', String(guide.id === selectedGuide));
      const top = document.createElement('span');
      top.className = 'record-topline';
      const id = document.createElement('span');
      id.textContent = guide.id;
      const topic = document.createElement('span');
      topic.textContent = guide.topic;
      top.append(id, topic);
      const title = document.createElement('strong');
      title.textContent = guide.title;
      button.append(top, title);
      button.addEventListener('click', () => { selectedGuide = guide.id; renderGuides(); });
      list.appendChild(button);
    });
    renderGuideDetail();
  }

  function renderGuideDetail() {
    const panel = document.querySelector('#hub .system-detail-panel');
    const guide = byGuideId.get(selectedGuide);
    panel.hidden = !guide;
    if (!guide) return;
    byId('guide-id').textContent = guide.id;
    byId('guide-topic').textContent = guide.topic;
    byId('guide-title').textContent = guide.title;
    byId('guide-summary').textContent = guide.summary;
    byId('guide-purpose').textContent = guide.purpose;
    const steps = byId('guide-steps');
    steps.replaceChildren();
    guide.steps.forEach(step => {
      const li = document.createElement('li');
      li.textContent = step;
      steps.appendChild(li);
    });
  }

  byId('change-search').addEventListener('input', renderChangeList);
  byId('status-filter').addEventListener('change', renderChangeList);
  byId('guide-search').addEventListener('input', renderGuides);
  byId('change-form').addEventListener('submit', event => {
    event.preventDefault();
    const change = changes.find(item => item.id === selectedChange);
    if (!change) return;
    const nextStatus = byId('change-status').value;
    const note = byId('decision-note').value.trim();
    const statusChanged = nextStatus !== statusOf(change);
    if (statusChanged) localChanges.statuses[change.id] = nextStatus;
    if (note) (localChanges.notes[change.id] ||= []).push(note);
    if (!statusChanged && !note) {
      byId('save-message').textContent = 'Choose a new status or add a note first.';
      return;
    }
    store();
    renderStats();
    renderChangeList();
    byId('save-message').textContent = 'Saved in this browser.';
  });
  byId('reset-demo').addEventListener('click', () => {
    localChanges = { statuses: {}, notes: {} };
    try { localStorage.removeItem(storageKey); } catch { /* In-memory reset still works. */ }
    selectedChange = changes[0].id;
    byId('change-search').value = '';
    byId('status-filter').value = 'all';
    renderStats();
    renderChangeList();
    byId('save-message').textContent = 'Fictional demo data restored.';
  });
  renderStats();
  renderChangeList();
  renderGuides();
})();

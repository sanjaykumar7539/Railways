(() => {
  const $ = id => document.getElementById(id);
  const state = { token: localStorage.getItem('railwaysToken'), user: JSON.parse(localStorage.getItem('railwaysUser') || 'null'), trains: [], selectedTrain: null, authMode: 'login' };
  const stations = ['Bengaluru', 'Chennai', 'Coimbatore', 'Madurai', 'Thanjavur', 'Tiruchirappalli'];
  const classes = { '1A': 'First AC', '2A': '2A · AC', '3A': '3A · AC', SL: 'Sleeper' };
  const modal = () => bootstrap.Modal.getOrCreateInstance($('authModal'));
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const money = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
  const today = new Date();
  const isoDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  $('journeyDate').min = isoDate;
  $('journeyDate').value = isoDate;

  async function api(url, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}), ...options.headers };
    const response = await fetch(url, { ...options, headers });
    const data = await response.json().catch(() => ({}));
    if (response.status === 401 && state.token) logout(false);
    if (!response.ok) throw new Error(data.message || 'Request failed. Please try again.');
    return data;
  }
  function showAlert(message, type = 'warning') {
    $('alertBox').className = `alert alert-${type} mt-3`;
    $('alertBox').textContent = message;
    $('alertBox').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  function clearAlert() { $('alertBox').className = 'alert mt-3 hidden'; $('alertBox').textContent = ''; }
  function updateUser() {
    const loggedIn = Boolean(state.token && state.user);
    $('loginBtn').classList.toggle('hidden', loggedIn);
    $('logoutBtn').classList.toggle('hidden', !loggedIn);
    $('userLabel').textContent = loggedIn ? `Hi, ${state.user.name}` : '';
  }
  function logout(notify = true) {
    state.token = null; state.user = null;
    localStorage.removeItem('railwaysToken'); localStorage.removeItem('railwaysUser');
    updateUser(); renderBookings([]);
    if (notify) showAlert('You have been logged out.', 'info');
  }
  function renderTrains(trains, travelClass, count) {
    $('trainResults').classList.remove('hidden');
    $('resultsSummary').textContent = `${trains.length} train${trains.length === 1 ? '' : 's'} · ${count} passenger${count === 1 ? '' : 's'} · ${classes[travelClass]}`;
    if (!trains.length) { $('trainList').innerHTML = '<div class="col-12"><div class="alert alert-light border">No demo trains found for this route/date and seat count. Try another route.</div></div>'; return; }
    $('trainList').innerHTML = trains.map(train => `<div class="col-12"><article class="card train-card shadow-sm"><div class="card-body p-4"><div class="row align-items-center g-3"><div class="col-md-3"><div class="small-muted">${escapeHtml(train.trainNumber)}</div><h3 class="h5 mb-0">${escapeHtml(train.trainName)}</h3></div><div class="col-md-5"><div class="d-flex align-items-center gap-3"><div><strong>${escapeHtml(train.departureTime)}</strong><div class="small-muted">${escapeHtml(train.fromStation)}</div></div><div class="flex-grow-1 text-center"><div class="small-muted small">${escapeHtml(train.duration)}</div><div class="route-line"></div></div><div><strong>${escapeHtml(train.arrivalTime)}</strong><div class="small-muted">${escapeHtml(train.toStation)}</div></div></div></div><div class="col-md-2"><span class="badge badge-class rounded-pill">${escapeHtml(classes[travelClass])}</span><div class="small mt-2">${train.availableSeats} demo seats</div></div><div class="col-md-2 text-md-end"><div class="fw-bold fs-5">${money(train.fare)}<small class="small-muted fs-6"> / person</small></div><button class="btn btn-danger mt-2 choose-train" data-id="${escapeHtml(train.id)}">Book</button></div></div></div></article></div>`).join('');
    document.querySelectorAll('.choose-train').forEach(button => button.addEventListener('click', () => selectTrain(button.dataset.id)));
  }
  async function searchTrains(event) {
    event?.preventDefault(); clearAlert();
    const from = $('stationFrom').value, to = $('stationTo').value, date = $('journeyDate').value;
    if (from === to) return showAlert('Please choose two different stations.');
    $('searchButton').disabled = true; $('searchButton').textContent = 'Searching…';
    try {
      const params = new URLSearchParams({ from, to, date, passengers: $('passengers').value, travelClass: $('trainClass').value });
      const result = await api(`/api/trains?${params}`);
      state.trains = result.trains; renderTrains(result.trains, result.travelClass, result.passengers);
    } catch (error) { showAlert(error.message, 'danger'); }
    finally { $('searchButton').disabled = false; $('searchButton').textContent = 'Search'; }
  }
  function selectTrain(id) {
    if (!state.token) { state.selectedTrain = id; openAuth('login'); $('authError').textContent = 'Log in or create an account before booking.'; $('authError').classList.remove('hidden'); return; }
    state.selectedTrain = state.trains.find(train => train.id === id);
    if (!state.selectedTrain) return showAlert('Train details expired. Search again.', 'warning');
    const count = Number($('passengers').value), train = state.selectedTrain, travelClass = $('trainClass').value;
    $('selectedTrain').textContent = `${train.trainNumber} · ${train.trainName} · ${train.fromStation} → ${train.toStation} · ${$('journeyDate').value}`;
    $('fareDetails').textContent = `(${classes[travelClass]} × ${count})`;
    $('totalAmount').textContent = money(train.fare * count);
    $('passengerFields').innerHTML = Array.from({ length: count }, (_, index) => `<div class="col-md-8"><label class="form-label" for="passengerName${index}">Passenger ${index + 1} name</label><input class="form-control passenger-name" id="passengerName${index}" maxlength="80" required></div><div class="col-md-4"><label class="form-label" for="passengerAge${index}">Age</label><input class="form-control passenger-age" id="passengerAge${index}" type="number" min="1" max="120" required></div>`).join('');
    $('contactEmail').value = state.user.email; $('reservationSection').classList.remove('hidden'); $('reservationSection').scrollIntoView({ behavior: 'smooth' });
  }
  function renderBookings(bookings) {
    if (!state.token) { $('bookingsList').innerHTML = '<div class="col-12"><div class="card"><div class="card-body text-center py-4"><p class="mb-2">Log in to see bookings associated with your account.</p><button id="bookingsLogin" class="btn btn-outline-danger btn-sm">Log in</button></div></div></div>'; $('bookingsLogin')?.addEventListener('click', () => openAuth('login')); return; }
    if (!bookings.length) { $('bookingsList').innerHTML = '<div class="col-12"><div class="card"><div class="card-body text-center text-secondary py-4">No bookings yet. Search for a train to get started.</div></div></div>'; return; }
    $('bookingsList').innerHTML = bookings.map(item => `<div class="col-12 col-lg-6"><article class="card shadow-sm h-100"><div class="card-body p-4"><div class="d-flex justify-content-between gap-2"><div><span class="small-muted">Booking ${escapeHtml(item.id)}</span><h3 class="h5 mt-1">${escapeHtml(item.trainName)} <span class="small fw-normal">(${escapeHtml(item.trainNumber)})</span></h3></div><span class="badge ${item.status === 'confirmed' ? 'text-bg-success' : 'text-bg-secondary'} align-self-start">${escapeHtml(item.status)}</span></div><p class="mb-1">${escapeHtml(item.fromStation)} → ${escapeHtml(item.toStation)}</p><p class="small-muted">${escapeHtml(item.journeyDate)} · ${escapeHtml(item.departureTime)} · ${escapeHtml(classes[item.travelClass] || item.travelClass)}</p><p class="mb-2">${item.passengers.length} passenger${item.passengers.length === 1 ? '' : 's'} · <strong>${money(item.totalFare)}</strong></p>${item.status === 'confirmed' ? `<button class="btn btn-outline-danger btn-sm cancel-booking" data-id="${escapeHtml(item.id)}">Cancel booking</button>` : ''}</div></article></div>`).join('');
    document.querySelectorAll('.cancel-booking').forEach(button => button.addEventListener('click', async () => {
      if (!confirm('Cancel this demo booking?')) return;
      button.disabled = true;
      try { await api(`/api/bookings/${encodeURIComponent(button.dataset.id)}`, { method: 'DELETE' }); await loadBookings(); showAlert('Booking cancelled.', 'success'); }
      catch (error) { showAlert(error.message, 'danger'); button.disabled = false; }
    }));
  }
  async function loadBookings() {
    if (!state.token) return renderBookings([]);
    try { renderBookings(await api('/api/bookings')); }
    catch (error) { if (state.token) showAlert(error.message, 'danger'); }
  }
  function openAuth(mode) {
    state.authMode = mode; const registering = mode === 'register';
    $('authTitle').textContent = registering ? 'Create your account' : 'Log in';
    $('authSubmit').textContent = registering ? 'Create account' : 'Log in';
    $('authPassword').autocomplete = registering ? 'new-password' : 'current-password';
    $('nameField').classList.toggle('hidden', !registering); $('authName').required = registering;
    $('authSwitchText').textContent = registering ? 'Already have an account?' : 'New here?';
    $('authSwitch').textContent = registering ? 'Log in' : 'Create account';
    $('authError').classList.add('hidden'); $('authError').textContent = ''; modal().show();
  }
  async function submitAuth(event) {
    event.preventDefault(); const registering = state.authMode === 'register';
    $('authSubmit').disabled = true; $('authSubmit').textContent = 'Please wait…'; $('authError').classList.add('hidden');
    const payload = { email: $('authEmail').value, password: $('authPassword').value, ...(registering ? { name: $('authName').value } : {}) };
    try {
      const result = await api(`/api/auth/${registering ? 'register' : 'login'}`, { method: 'POST', body: JSON.stringify(payload) });
      state.token = result.token; state.user = result.user;
      localStorage.setItem('railwaysToken', state.token); localStorage.setItem('railwaysUser', JSON.stringify(state.user));
      updateUser(); modal().hide(); await loadBookings();
      if (state.selectedTrain) selectTrain(state.selectedTrain.id || state.selectedTrain);
    } catch (error) { $('authError').textContent = error.message; $('authError').classList.remove('hidden'); }
    finally { $('authSubmit').disabled = false; $('authSubmit').textContent = registering ? 'Create account' : 'Log in'; }
  }
  async function submitBooking(event) {
    event.preventDefault(); if (!state.selectedTrain || !state.token) return showAlert('Please log in and select a train first.');
    const names = [...document.querySelectorAll('.passenger-name')], ages = [...document.querySelectorAll('.passenger-age')];
    const passengers = names.map((input, index) => ({ name: input.value.trim(), age: Number(ages[index].value) }));
    $('bookButton').disabled = true; $('bookButton').textContent = 'Saving booking…';
    try {
      const result = await api('/api/bookings', { method: 'POST', body: JSON.stringify({ trainId: state.selectedTrain.id, journeyDate: $('journeyDate').value, travelClass: $('trainClass').value, passengers, contact: { email: $('contactEmail').value, phone: $('phone').value } }) });
      $('reservationSection').classList.add('hidden'); $('reservationForm').reset(); state.selectedTrain = null;
      showAlert(`Booking confirmed. Reference: ${result.booking.id}. This demo does not collect payment.`, 'success');
      await loadBookings(); $('myBookings').scrollIntoView({ behavior: 'smooth' });
    } catch (error) { showAlert(error.message, 'danger'); }
    finally { $('bookButton').disabled = false; $('bookButton').textContent = 'Confirm demo booking'; }
  }
  function init() {
    for (const id of ['stationFrom', 'stationTo']) stations.forEach(station => $(id).add(new Option(station, station)));
    $('searchForm').addEventListener('submit', searchTrains);
    $('loginBtn').addEventListener('click', () => openAuth('login'));
    $('logoutBtn').addEventListener('click', () => logout());
    $('authSwitch').addEventListener('click', () => openAuth(state.authMode === 'login' ? 'register' : 'login'));
    $('authForm').addEventListener('submit', submitAuth);
    $('reservationForm').addEventListener('submit', submitBooking);
    $('refreshBookings').addEventListener('click', loadBookings);
    $('backToSearch').addEventListener('click', () => { $('reservationSection').classList.add('hidden'); $('booking').scrollIntoView({ behavior: 'smooth' }); });
    updateUser(); loadBookings();
    if (state.token) api('/api/health').catch(() => {});
  }
  document.addEventListener('DOMContentLoaded', init);
})();

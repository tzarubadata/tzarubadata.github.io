(() => {
  const svgNS = 'http://www.w3.org/2000/svg';
  const depot = { x: 400, y: 260 };
  const colors = ['#d3f36a', '#83d2e7', '#ffc98e', '#c7b5ff', '#ff9ba2', '#91dfbf'];
  const centers = [
    { x: 165, y: 145 }, { x: 365, y: 108 }, { x: 615, y: 150 },
    { x: 180, y: 370 }, { x: 430, y: 385 }, { x: 645, y: 365 },
  ];
  let seed = 47291;
  const random = () => ((seed = (1664525 * seed + 1013904223) >>> 0) / 4294967296);
  const stops = Array.from({ length: 36 }, (_, i) => {
    const center = centers[i % centers.length];
    return {
      id: i + 1,
      x: Math.max(65, Math.min(735, center.x + (random() - .5) * 145)),
      y: Math.max(55, Math.min(465, center.y + (random() - .5) * 115)),
    };
  });
  const stopById = new Map(stops.map(stop => [stop.id, stop]));
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const pad = id => String(id).padStart(2, '0');

  function routeMinutes(ids) {
    if (!ids.length) return 0;
    let point = depot;
    let distanceTotal = 0;
    for (const id of ids) {
      const next = stopById.get(id);
      distanceTotal += distance(point, next);
      point = next;
    }
    distanceTotal += distance(point, depot);
    return distanceTotal * .1 + ids.length * 4;
  }

  function nearestOrder(ids) {
    const remaining = [...ids];
    const ordered = [];
    let point = depot;
    while (remaining.length) {
      remaining.sort((a, b) => distance(point, stopById.get(a)) - distance(point, stopById.get(b)));
      const next = remaining.shift();
      ordered.push(next);
      point = stopById.get(next);
    }
    return ordered;
  }

  function planRoutes(deliveryCount, driverCount) {
    const remaining = stops.slice(0, deliveryCount).map(stop => stop.id);
    const routes = Array.from({ length: driverCount }, () => []);
    while (remaining.length) {
      const workloads = routes.map(routeMinutes);
      const routeIndex = workloads.indexOf(Math.min(...workloads));
      const currentRoute = routes[routeIndex];
      const point = currentRoute.length ? stopById.get(currentRoute[currentRoute.length - 1]) : depot;
      const candidates = [...remaining]
        .sort((a, b) => distance(point, stopById.get(a)) - distance(point, stopById.get(b)))
        .slice(0, 4);
      const density = id => remaining.filter(other => other !== id && distance(stopById.get(id), stopById.get(other)) < 100).length;
      candidates.sort((a, b) =>
        (distance(point, stopById.get(a)) - density(a) * 7) -
        (distance(point, stopById.get(b)) - density(b) * 7)
      );
      const chosen = candidates[0];
      currentRoute.push(chosen);
      remaining.splice(remaining.indexOf(chosen), 1);
    }

    for (let pass = 0; pass < 40; pass++) {
      const times = routes.map(routeMinutes);
      const originalSpread = Math.max(...times) - Math.min(...times);
      let bestSpread = originalSpread;
      let bestMove = null;
      for (let from = 0; from < routes.length; from++) {
        if (routes[from].length < 2) continue;
        for (let to = 0; to < routes.length; to++) {
          if (from === to || times[from] <= times[to]) continue;
          for (const id of routes[from]) {
            const shorter = nearestOrder(routes[from].filter(stopId => stopId !== id));
            const longer = nearestOrder([...routes[to], id]);
            const trial = times.map((time, index) => index === from ? routeMinutes(shorter) : index === to ? routeMinutes(longer) : time);
            const spread = Math.max(...trial) - Math.min(...trial);
            if (spread + .1 < bestSpread) {
              bestSpread = spread;
              bestMove = { from, to, shorter, longer };
            }
          }
        }
      }
      if (!bestMove) break;
      routes[bestMove.from] = bestMove.shorter;
      routes[bestMove.to] = bestMove.longer;
    }
    return routes.map(nearestOrder);
  }

  function svgElement(tag, attributes = {}) {
    const element = document.createElementNS(svgNS, tag);
    for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, String(value));
    element.classList.add('dynamic');
    return element;
  }

  function renderMap(routes, activeStops) {
    const svg = document.getElementById('route-map');
    svg.querySelectorAll('.dynamic').forEach(element => element.remove());
    for (let x = 50; x <= 750; x += 50) svg.appendChild(svgElement('line', { x1: x, y1: 0, x2: x, y2: 520, stroke: '#294766', 'stroke-width': 1 }));
    for (let y = 50; y <= 500; y += 50) svg.appendChild(svgElement('line', { x1: 0, y1: y, x2: 800, y2: y, stroke: '#294766', 'stroke-width': 1 }));

    routes.forEach((route, index) => {
      const points = [depot, ...route.map(id => stopById.get(id)), depot];
      const line = svgElement('polyline', {
        points: points.map(point => `${point.x},${point.y}`).join(' '),
        fill: 'none', stroke: colors[index], 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: .94,
      });
      svg.appendChild(line);
    });

    activeStops.forEach(stop => {
      const routeIndex = routes.findIndex(route => route.includes(stop.id));
      const dot = svgElement('circle', { cx: stop.x, cy: stop.y, r: 11, fill: colors[routeIndex], stroke: '#10213b', 'stroke-width': 3 });
      const title = document.createElementNS(svgNS, 'title');
      title.textContent = `Fictional stop ${pad(stop.id)}, Driver ${String.fromCharCode(65 + routeIndex)}`;
      dot.appendChild(title);
      svg.appendChild(dot);
    });
    svg.appendChild(svgElement('rect', { x: depot.x - 12, y: depot.y - 12, width: 24, height: 24, rx: 3, fill: '#ffffff', stroke: '#10213b', 'stroke-width': 3 }));
  }

  function renderResults(routes) {
    const body = document.getElementById('route-rows');
    body.replaceChildren();
    const times = routes.map(routeMinutes);
    const rankedByStops = routes
      .map((route, index) => ({ index, stops: route.length }))
      .sort((a, b) => b.stops - a.stops);
    const vehicleFit = Array(routes.length).fill('Standard vehicle');
    const edgeCount = Math.max(1, Math.floor(routes.length / 3));
    rankedByStops.slice(0, edgeCount).forEach(({ index }) => { vehicleFit[index] = 'Larger cargo'; });
    rankedByStops.slice(-edgeCount).forEach(({ index }) => { vehicleFit[index] = 'Limited capacity'; });
    routes.forEach((route, index) => {
      const tr = document.createElement('tr');
      const driver = document.createElement('th');
      driver.scope = 'row';
      const swatch = document.createElement('span');
      swatch.className = 'driver-swatch';
      swatch.style.backgroundColor = colors[index];
      swatch.setAttribute('aria-hidden', 'true');
      driver.append(swatch, `Driver ${String.fromCharCode(65 + index)}`);
      const count = document.createElement('td');
      count.textContent = String(route.length);
      const duration = document.createElement('td');
      duration.textContent = `${Math.round(times[index])} min`;
      const vehicle = document.createElement('td');
      vehicle.textContent = vehicleFit[index];
      const sequence = document.createElement('td');
      sequence.textContent = route.map(pad).join(' → ');
      tr.append(driver, count, duration, vehicle, sequence);
      body.appendChild(tr);
    });
    const spread = Math.round(Math.max(...times) - Math.min(...times));
    document.getElementById('route-spread').textContent = `Longest and shortest estimates differ by ${spread} minutes.`;
  }

  function build() {
    const deliveryCount = Number(document.getElementById('delivery-count').value);
    const driverCount = Number(document.getElementById('driver-count').value);
    const routes = planRoutes(deliveryCount, driverCount);
    renderMap(routes, stops.slice(0, deliveryCount));
    renderResults(routes);
    document.getElementById('map-count').textContent = `${deliveryCount} fictional stops · ${driverCount} drivers`;
  }

  document.getElementById('route-form').addEventListener('submit', event => { event.preventDefault(); build(); });
  build();
})();

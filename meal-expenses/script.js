(function (d3) {
  'use strict';

  var width = 1200,
      height = 150,
      cellSizeInner = 17,
      cellSize = 20;

  var day = d3.time.format("%w"),
      week = d3.time.format("%U"),
      format = d3.time.format("%Y-%m-%d");

  var svg = d3.select('#viz').selectAll('svg')
      .data(d3.range(2015, 2016))
    .enter().append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('class', 'RdYlGn')
    .append('g')
      .attr('transform', 'translate(' + ((width - cellSize * 53) / 2) + ',' + (height - cellSize * 7 - 1) + ')');

  svg.append('text')
    .attr('transform', 'translate(-20,' + cellSize * 3.5 + ') rotate(-90)')
    .style('text-anchor', 'middle')
    .attr('class', 'year-label')
    .text(function(d) { return d; });

  var rect = svg.selectAll('.day')
      .data(function(d) { return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
    .enter().append('rect')
      .attr('class', 'day')
      .attr('width', cellSizeInner)
      .attr('height', cellSizeInner)
      .attr('x', function(d) { return week(d) * cellSize; })
      .attr('y', function(d) { return day(d) * cellSize; })
      .datum(format);

  rect.append('title')
      .text(function(d) { return d; });

  svg.selectAll('.month')
      .data(function(d) { return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
    .enter().append('path')
      .attr('class', 'month')
      .attr('d', monthPath);

  function monthPath(t0) {
    var margin1 = 1,
        margin2 = 2,
        margin3 = 3,
        t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
        d0 = +day(t0),
        w0 = +week(t0),
        d1 = +day(t1),
        w1 = +week(t1);

    return 'M' + ((w0 + 1) * cellSize - (w0 === 0 ? margin3 : 0)) + ',' + (d0 * cellSize - (d0 === 0 ? margin2 : 0))
        + 'H' + (w0 * cellSize - (w0 === 0 ? margin3 : 0)) + 'V' + (7 * cellSize + 0)
        + 'H' + (w1 * cellSize - (w1 === 52 ? margin1 : 0)) + 'V' + ((d1 + 1) * cellSize - 0)
        + 'H' + ((w1 + 1) * cellSize - (w1 === 52 ? margin1 : 0)) + 'V' + (0 - margin2)
        + 'H' + ((w0 + 1) * cellSize - (w0 === 0 ? margin3 : 0)) + 'Z';
  }

  d3.json('meal-expenses.json', function(error, json) {
    // var days = d3.time.days(new Date(2015, 0, 1), new Date(2016, 0, 1));
    var data = {};

    var budgetPerDay = json.mealPerDay * json.singleMealBudget;
    var expenses = d3.map(json.expenses)
      .forEach(function (date, amount) {
        var start = format.parse(date);
        var end = d3.time.format('%j').parse('' + (d3.time.dayOfYear(start) + 1 + (amount / budgetPerDay)));
        end.setFullYear(start.getFullYear());

        d3.time.days(start, end).forEach(function (d) {
          d = format(d);
          data[d] = (data[d] || 0) + budgetPerDay;
        });
      });

    var color = d3.scale.quantize()
      .domain([0, budgetPerDay * 4])
      .range(d3.range(11).map(function(d) { return 'q' + d + '-11'; }));

    rect.filter(function(d) { return d in data; })
        .attr('class', function(d) {
          var isToday = d === format((new Date()));
          return 'day ' + color(data[d]) + (isToday ? ' today' : '');
        })
      .select('title')
        .text(function(d) { return d + ": " + json.unit + data[d]; });
  });

})(window.d3);

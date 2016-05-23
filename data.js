///<reference path="d3.d.ts" />
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Chart;
(function (Chart) {
    var Base = (function () {
        function Base(element) {
            this.element = element;
            this.iso8601 = d3.time.format('%Y-%m-%d');
            this.chartWidth = 800;
        }
        return Base;
    })();
    Chart.Base = Base;
    var Bar = (function (_super) {
        __extends(Bar, _super);
        function Bar(element) {
            _super.call(this, element);
            this.chartHeight = 400;
            this.chartWidth = 800;
            this.legendItemHeight = 30;
            this.legendWidth = 150;
            this.colors = ['rgb(0, 113, 188)', 'rgb(0, 174, 239)', 'rgb(145, 0, 145)'];
            this.xAxisHashHeight = 10;
            this.layout = 'wiggle';
            this.element = element;
        }
        Bar.prototype.render = function (data) {
            var _this = this;
            // Create stack layout
            var stackLayout = d3.layout.stack()
                .values(function (d) { return d.data; })
                .offset(this.layout);
            var stackData = stackLayout(data);
            // Maximum measurement in the dataset
            var maxY = d3.max(stackData, function (d) { return d3.max(d.data, function (d) { return d.y0 + d.y; }); });
            // Earliest day in the dataset
            var minX = d3.min(data, function (d) { return d3.min(d.data, function (d) { return d.x; }); });
            // All days in the dataset (from earliest day until now)
            var days = d3.time.days(minX, new Date());
            // Area of the region containing the bars
            var areaWidth = this.chartWidth - this.legendWidth;
            var barWidth = areaWidth / days.length;
            // Create scales for X and Y axis (X based on dates, Y based on performance data)
            var x = d3.time.scale()
                .domain([minX, d3.time.day(d3.time.day.offset(new Date(), 1))])
                .range([0, this.chartWidth - this.legendWidth]);
            var y = d3.scale.linear()
                .domain([0, maxY])
                .range([0, this.chartHeight]);
            var ticks = x.ticks(d3.time.mondays, 1);
            // SVG element
            var svg = this.element.append('svg')
                .attr('height', this.chartHeight + 25)
                .attr('width', this.chartWidth);
            // Groups that contain bar segments for each dataset
            var barGroups = svg.selectAll('g.bars')
                .data(stackData)
                .enter().append('g')
                .attr('class', 'bars')
                .style('fill', function (d, i) { return _this.colors[i]; })
                .attr('transform', 'translate(' + this.legendWidth + ', 0)');
            // Legend
            var legendGroup = svg.append('g')
                .attr('class', 'legend');
            // Legend items
            var legendItem = legendGroup.selectAll('g.legendItem')
                .data(stackData)
                .enter().append('g')
                .attr('class', 'legendItem')
                .style('fill', function (d, i) { return _this.colors[i]; })
                .attr('transform', function (d, i) { return 'translate(0, ' + (_this.legendItemHeight * (2 - i)) + ')'; });
            legendItem.append('rect')
                .attr('width', 25)
                .attr('height', 25);
            legendItem.append('text')
                .text(function (d) { return d.desc; })
                .attr('x', 30)
                .attr('dy', '1em');
            // Bars
            var rects = barGroups.selectAll('rect')
                .data(function (d) { return d.data; })
                .enter()
                .append('rect')
                .attr('x', function (d, i) { return x(d.x); })
                .attr('y', function (d, i) { return _this.chartHeight - y(d.y + d.y0); })
                .attr('width', barWidth)
                .attr('height', function (d, i) { return y(d.y); });
            // Add title (mouseover popup) to bars           
            rects.append('title')
                .text(function (d) { return _this.iso8601(d.x) + ' - ' + d.y + 'ms'; });
            // Add an axis marker to the bottom
            var axis = d3.svg.axis();
            axis.scale(x)
                .ticks(d3.time.mondays, 1)
                .tickSubdivide(6)
                .tickFormat(this.iso8601)
                .tickSize(10, 5, 0);
            var axisGroup = svg.append('g')
                .attr('class', 'axis')
                .attr('transform', 'translate(' + this.legendWidth + ',' + this.chartHeight + ')')
                .call(axis);
        };
        return Bar;
    })(Base);
    Chart.Bar = Bar;
})(Chart || (Chart = {}));
var start = d3.time.day.offset(new Date(), -30);
var end = new Date();
var days = d3.time.days(start, end);
function decreasingRandom(start, deviation, factor) {
    var factorRandom = d3.random.normal(factor, 0.05);
    return function () {
        var random = d3.random.normal(start, deviation)();
        start = start * factorRandom();
        return parseFloat(random.toFixed());
    };
}
var parseRandom = decreasingRandom(400, 20, 0.97);
var typecheckRandom = decreasingRandom(500, 20, 0.97);
var emitRandom = decreasingRandom(100, 10, 0.97);
var parseData = days.map(function (day) { return ({ x: day, y: parseRandom() }); });
var typecheckData = days.map(function (day) { return ({ x: day, y: typecheckRandom() }); });
var emitData = days.map(function (day) { return ({ x: day, y: emitRandom() }); });
document.addEventListener('DOMContentLoaded', function () {
    var normalizedData = [
        { desc: 'Emit', data: emitData },
        { desc: 'Typecheck', data: typecheckData },
        { desc: 'Parse', data: parseData }
    ];
    var perfchart = new Chart.Bar(d3.select('#performanceChart'));
    perfchart.render(normalizedData);
});
//# sourceMappingURL=data.js.map
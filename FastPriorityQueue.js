'use strict';
var defaultcomparator = function (a, b) { return a < b };
function FastPriorityQueue(a) { this.array = [], this.size = 0, this.compare = a || defaultcomparator }
FastPriorityQueue.prototype.add = function (a) { var b = this.size; for (this.array[this.size++] = a; 0 < b;) { var c = b - 1 >> 1, d = this.array[c]; if (!this.compare(a, d)) break; this.array[b] = d, b = c } this.array[b] = a };
FastPriorityQueue.prototype.heapify = function (a) { this.array = a, this.size = a.length; for (var b = this.size >> 1; 0 <= b; b--)this._percolateDown(b) };
FastPriorityQueue.prototype._percolateUp = function (a) { for (var b = this.array[a]; 0 < a;) { var c = a - 1 >> 1, d = this.array[c]; if (!this.compare(b, d)) break; this.array[a] = d, a = c } this.array[a] = b };
FastPriorityQueue.prototype._percolateDown = function (a) { for (var b = this.size, c = this.size >>> 1, d = this.array[a]; a < c;) { var e = (a << 1) + 1, f = e + 1, g = this.array[e]; if (f < b && this.compare(this.array[f], g) && (e = f, g = this.array[f]), !this.compare(g, d)) break; this.array[a] = g, a = e } this.array[a] = d };
FastPriorityQueue.prototype.peek = function () { return this.array[0] };
FastPriorityQueue.prototype.poll = function () { var b = this.array[0]; return 1 < this.size ? (this.array[0] = this.array[--this.size], this._percolateDown(0)) : 0 == this.size && --this.size, b };
FastPriorityQueue.prototype.trim = function () { this.array = this.array.slice(0, this.size) };
FastPriorityQueue.prototype.isEmpty = function () { return 0 == this.size };

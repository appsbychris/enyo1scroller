enyo.kind({
name: "CustomScrollStrategy",
kind: enyo.Component,
published: {
vertical: !0,
horizontal: !0
},
events: {
onScrollStart: "scrollStart",
onScroll: "scroll",
onScrollStop: "scrollStop"
},
kSpringDamping: .5,
kDragDamping: .5,
kFrictionDamping: .97,
kSnapFriction: .9,
kFlickScalar: .01,
kFrictionEpsilon: .01,
topBoundary: 0,
rightBoundary: 0,
bottomBoundary: 0,
leftBoundary: 0,
interval: 20,
fixedTime: !0,
x0: 0,
x: 0,
y0: 0,
y: 0,
destroy: function() {
this.stop(), this.inherited(arguments);
},
verlet: function(a) {
var b = this.x;
this.x += b - this.x0, this.x0 = b;
var c = this.y;
this.y += c - this.y0, this.y0 = c;
},
damping: function(a, b, c, d) {
var e = .5, f = a - b;
return Math.abs(f) < e ? b : a * d > b * d ? c * f + b : a;
},
boundaryDamping: function(a, b, c, d) {
return this.damping(this.damping(a, b, d, 1), c, d, -1);
},
constrain: function() {
var a = this.boundaryDamping(this.y, this.topBoundary, this.bottomBoundary, this.kSpringDamping);
a != this.y && (this.y0 = a - (this.y - this.y0) * this.kSnapFriction, this.y = a);
var b = this.boundaryDamping(this.x, this.leftBoundary, this.rightBoundary, this.kSpringDamping);
b != this.x && (this.x0 = b - (this.x - this.x0) * this.kSnapFriction, this.x = b);
},
friction: function(a, b, c) {
var d = this[a] - this[b], e = Math.abs(d) > this.kFrictionEpsilon ? c : 0;
this[a] = this[b] + e * d;
},
frame: 10,
simulate: function(a) {
while (a >= this.frame) a -= this.frame, this.dragging || this.constrain(), this.verlet(), this.friction("y", "y0", this.kFrictionDamping), this.friction("x", "x0", this.kFrictionDamping);
return a;
},
animate: function() {
this.stop();
var a = (new Date).getTime(), b = 0, c, d, e = enyo.bind(this, function() {
var f = (new Date).getTime();
this.job = enyo.requestAnimationFrame(e);
var g = f - a;
a = f, this.dragging && (this.y0 = this.y = this.uy, this.x0 = this.x = this.ux), b += Math.max(16, g), this.fixedTime && !this.isInOverScroll() && (b = this.interval), b = this.simulate(b), d != this.y || c != this.x ? this.scroll() : this.dragging || (this.stop(true), this.scroll()), d = this.y, c = this.x;
});
this.job = enyo.requestAnimationFrame(e);
},
start: function() {
this.job || (this.animate(), this.doScrollStart());
},
stop: function(a) {
this.job = enyo.cancelRequestAnimationFrame(this.job), a && this.doScrollStop();
},
startDrag: function(a) {
this.dragT0 = new Date().getTime();
this.flickx = this.x, this.flicky = this.y;
this.dragging = !0, this.my = a.pageY, this.py = this.uy = this.y, this.mx = a.pageX, this.px = this.ux = this.x;
},
drag: function(a) {
if (this.dragging) {
var b = this.vertical ? a.pageY - this.my : 0;
this.uy = b + this.py, this.uy = this.boundaryDamping(this.uy, this.topBoundary, this.bottomBoundary, this.kDragDamping);
var c = this.horizontal ? a.pageX - this.mx : 0;
var currentsign = 0;
if(this.vertical){
    currentsign = (((b-this.lastb) < 0) ? -1 : 1);
}else{
    currentsign = (((c-this.lastc) < 0) ? -1 : 1);
}
if( currentsign != this.lastsign  ){
    this.dragT0 = new Date().getTime();
    this.flickx = this.x, this.flicky = this.y;
}
this.lastsign = currentsign;
this.lastc = c;
this.lastb = b;
return this.ux = c + this.px, this.ux = this.boundaryDamping(this.ux, this.leftBoundary, this.rightBoundary, this.kDragDamping), this.start(), !0;
}
},
dragDrop: function(a) {
if (this.dragging && !window.PalmSystem) {
var b = .5;
this.y = this.uy, this.y0 = this.y - (this.y - this.y0) * b, this.x = this.ux, this.x0 = this.x - (this.x - this.x0) * b;
}
this.dragging = !1;
},
dragFinish: function() {
this.dragging = !1;
var dragT1 = new Date().getTime() - this.dragT0;
var vx = (this.x - this.flickx) / dragT1 * 1200;
var vy = (this.y - this.flicky) / dragT1 * 1200;
var v = Math.sqrt(vx*vx + vy*vy);

if (v > 600 && dragT1 < 300) {
	if (ISPHONE) {
		vx=vx*2;
		vy=vy*2;
	}
    this.flick({xVel:vx, yVel:vy});
}
},
flick: function(a) {
this.vertical && (this.y = this.y0 + a.yVel * this.kFlickScalar), this.horizontal && (this.x = this.x0 + a.xVel * this.kFlickScalar), this.start();
},
mousewheel: function(a) {
this.stop();
var b = this.vertical ? a.wheelDeltaY : 0;
this.y = this.y0 = this.y0 + b, this.start();
},
scroll: function() {
this.doScroll();
},
setScrollPosition: function(a) {
this.y = this.y0 = a;
},
isScrolling: function() {
return this.job;
},
isInOverScroll: function() {
return this.job && (this.x > this.leftBoundary || this.x < this.rightBoundary || this.y > this.topBoundary || this.y < this.bottomBoundary);
}
});

/**
enyo.DragScroller is a base kind that integrates the scrolling simulation provided
by <a href="#enyo.ScrollStrategy">enyo.ScrollStrategy</a>
into a Control</a>.

enyo.ScrollStrategy is not typically created in application code.
*/
enyo.kind({
	name: "CustomDragScroller",
	kind: enyo.Control,
	/**
		If true, the scroller will not propagate dragstart events that cause it to start scrolling (defaults to true)
	*/
	preventDragPropagation: true,
	published: {
		/**
		Set to false to prevent horizontal scrolling.
		*/
		horizontal: true,
		/**
		Set to false to prevent vertical scrolling.
		*/
		vertical: true
	},
	//* @protected
	tools: [
		{name: "scroll", kind: "CustomScrollStrategy"}
	],
	create: function() {
		this.inherited(arguments);
		this.horizontalChanged();
		this.verticalChanged();
	},
	initComponents: function() {
		this.createComponents(this.tools);
		this.inherited(arguments);
	},
	horizontalChanged: function() {
		this.$.scroll.setHorizontal(this.horizontal);
	},
	verticalChanged: function() {
		this.$.scroll.setVertical(this.vertical);
	},
	shouldDrag: function(e) {
		var requestV = e.vertical;
		// FIXME: auto* are not part of this class
		// FIXME: whether an autoHorizontal scroller will actually 
		// require horizontal scrolling is not known at this point
		// which can be repaired with some refactoring.
		var canH = this.horizontal;
		var canV = this.vertical;
		return requestV && canV || !requestV && canH;
	},
	//
	// FIXME: seems like a lot of work to route these events
	//
	flickHandler: function(inSender, e) {
		var onAxis = Math.abs(e.xVel) > Math.abs(e.yVel) ? this.horizontal : this.vertical;
		if (onAxis) {
			this.$.scroll.flick(e);
			return this.preventDragPropagation;
		}
	},
	mouseholdHandler: function(inSender, e) {
		if (this.$.scroll.isScrolling() && !this.$.scroll.isInOverScroll()) {
			this.$.scroll.stop(e);
			return true;
		}
	},
	// special synthetic DOM events served up by the Gesture system
	dragstartHandler: function(inSender, inEvent) {
		this.dragging = this.shouldDrag(inEvent);
		if (this.dragging) {
			this.$.scroll.startDrag(inEvent);

			if (this.preventDragPropagation) {
				//this.log("PREVENT DRAG")
				return true;
			}
		}
	},
	dragHandler: function(inSender, inEvent) {
		if (this.dragging) {
			this.$.scroll.drag(inEvent);
		}
	},
	dragfinishHandler: function(inSender, inEvent) {
		if (this.dragging) {
			inEvent.preventClick();
			this.$.scroll.dragDrop(inEvent);
			this.$.scroll.dragFinish();
			this.dragging = false;
		}
	},
	mousewheelHandler: function(inSender, e) {
		if (!this.dragging) {
			this.$.scroll.mousewheel(e);
		}
	}
});

//* @protected
enyo.kind({
	name: "CustomVirtualScroller",
	kind: "CustomDragScroller",
	events: {
		onScroll: ""
	},
	published: {
		/**
		Use accelerated scrolling.
		*/
		accelerated: false
	},
	className: "enyo-virtual-scroller",
	//* @protected
	tools: [
		{name: "scroll", kind: "CustomScrollStrategy", topBoundary: 1e9, bottomBoundary: -1e9}
	],
	chrome: [
		// fitting div to prevent layout leakage
		{className: "enyo-fit", components: [
			// important for compositing that this height be fixed, as to avoid reallocating textures
			{name: "content", height: "2048px"}
		]}
	],
	//
	// custom sliding-buffer
	//
	top: 0,
	bottom: -1,
	pageTop: 0,
	pageOffset: 0,
	contentHeight: 0,
	constructor: function() {
		this.heights = [];
		this.inherited(arguments);
	},
	create: function() {
		this.inherited(arguments);
		this.acceleratedChanged();
	},
	rendered: function() {
		this.inherited(arguments);
		this.measure();
		this.$.scroll.animate();
		// animate will not do anything if the object is in steady-state
		// so we ensure we have filled our display buffer here
		this.updatePages();
	},
	acceleratedChanged: function() {
		var p = this.pageTop;
		this.pageTop = 0;
		if (this.effectScroll) {
			this.effectScroll();
		}
		this.pageTop = p;
		this.effectScroll = this.accelerated ? this.effectScrollAccelerated : this.effectScrollNonAccelerated;
		this.$.content.applyStyle("margin", this.accelerated ? null : "900px 0");
		this.$.content.addRemoveClass("enyo-accel-children", this.accelerated);
		this.effectScroll();
	},
	measure: function() {
		//this.unlockClipRegion();
		this.viewNode = this.hasNode();
		if (this.viewNode) {
			this.viewHeight = this.viewNode.clientHeight;
		}
	},
	//
	// prompt the scroller to start.
	start: function() {
		this.$.scroll.start();
	},
	//
	// FIXME: Scroller's shiftPage/unshiftPage/pushPage/popPage are implemented via adjustTop/adjustBottom
	// Conversely, Buffer's adjustTop/adjustBottom are implemented via shift/unshift/push/pop
	// Presumably there is a less confusing way of factoring or naming the methods.
	//
	// abstract: subclass must supply
	adjustTop: function(inTop) {
	},
	// abstract: subclass must supply
	adjustBottom: function(inBottom) {
	},
	// add a page to the top of the window
	unshiftPage: function() {
		var t = this.top - 1;
		if (this.adjustTop(t) === false) {
			return false;
		}
		this.top = t;
	},
	// remove a page from the top of the window
	shiftPage: function() {
		this.adjustTop(++this.top);
	},
	// add a page to the top of the window
	pushPage: function() {
		//this.log(this.top, this.bottom);
		var b = this.bottom + 1;
		if (this.adjustBottom(b) === false) {
			return false;
		}
		this.bottom = b;
	},
	// remove a page from the top of the window
	popPage: function() {
		this.adjustBottom(--this.bottom);
	},
	//
	// NOTES:
	//
	// pageOffset represents the scroll-distance in the logical display (from ScrollManager's perspective)
	// that is hidden from the real display (via: display: none). It's measured as pixels above the origin, so
	// the value is <= 0.
	//
	// pageTop is the scroll position on the real display, also <= 0.
	//
	// show pages that have scrolled in from the bottom
	pushPages: function() {
		// contentHeight is the height of displayed DOM pages
		// pageTop is the actual scrollTop for displayed DOM pages (negative)
		while (this.contentHeight + this.pageTop < this.viewHeight) {
			if (this.pushPage() === false) {
				this.$.scroll.bottomBoundary = Math.min(-this.contentHeight + this.pageOffset + this.viewHeight, -1);
				break;
			}
			// NOTE: this.heights[this.bottom] can be undefined if there is no data to render, and therefore no nodes at this.bottom
			this.contentHeight += this.heights[this.bottom] || 0;
		}
	},
	// hide pages that have scrolled off of the bottom
	popPages: function() {
		// NOTE: this.heights[this.bottom] can be undefined if there is no data to render, and therefore no nodes at this.bottom
		var h = this.heights[this.bottom];
		while (h !== undefined && this.bottom && this.contentHeight + this.pageTop - h > this.viewHeight) {
			this.popPage();
			this.contentHeight -= h;
			h = this.heights[this.bottom];
		}
	},
	// hide pages that have scrolled off the top
	shiftPages: function() {
		// the height of the first (displayed) page
		var h = this.heights[this.top];
		while (h !== undefined && h < -this.pageTop) {
			// increase the distance from the logical display that is hidden from the real display
			this.pageOffset -= h;
			// decrease the distance representing the scroll position on the real display
			this.pageTop += h;
			// decrease the height of the real display
			this.contentHeight -= h;
			// process the buffer movement
			this.shiftPage();
			// the height of the new first page
			h = this.heights[this.top];
		}
	},
	// show pages that have scrolled in from the top
	unshiftPages: function() {
		while (this.pageTop > 0) {
			if (this.unshiftPage() === false) {
				this.$.scroll.topBoundary = this.pageOffset;
				this.$.scroll.bottomBoundary = -9e9;
				break;
			}
			// note: if h is zero we will loop again
			var h = this.heights[this.top];
			if (h === undefined) {
				this.top++;
				return;
			}
			this.contentHeight += h;
			this.pageOffset += h;
			this.pageTop -= h;
		}
	},
	updatePages: function() {
		if (!this.viewNode) {
			return;
		}
		// re-query viewHeight every iteration
		// querying DOM can cause a synchronous layout
		// but commonly there is no dirty layout at this time.
		this.viewHeight = this.viewNode.clientHeight;
		if (this.viewHeight <= 0) {
			return;
		}
		//
		// recalculate boundaries every iteration
		var ss = this.$.scroll;
		ss.topBoundary = 9e9;
		ss.bottomBoundary = -9e9;
		//
		// show pages that have scrolled in from the bottom
		this.pushPages();
		// hide pages that have scrolled off the bottom
		this.popPages();
		// show pages that have scrolled in from the top
		this.unshiftPages();
		// hide pages that have scrolled off the top
		this.shiftPages();
		//
		// pageTop can change as a result of updatePages, so we need to perform content translation
		// via effectScroll
		// scroll() method doesn't call effectScroll because we call it here
		this.effectScroll();
	},
	scroll: function() {
		// calculate relative pageTop
		var pt = Math.round(this.$.scroll.y) - this.pageOffset;
		if (pt == this.pageTop) {
			return;
		}
		// page top drives all page rendering / discarding
		this.pageTop = pt;
		// add or remove pages from either end to satisfy display requirements
		this.updatePages();
		// perform content translation
		this.doScroll();
	},
	// NOTE: there are a several ways to effect content motion.
	// The 'transform' method in combination with hardware acceleration promises
	// the smoothest animation, but hardware acceleration in combination with the
	// trick-scrolling gambit implemented here produces visual artifacts.
	// In the absence of hardware acceleration, scrollTop appears to be the fastest method.
	effectScrollNonAccelerated: function() {
		//webosEvent.event('', 'enyo:effectScrollNonAccelerated', '');
		if (this.hasNode()) {
			this.node.scrollTop = 900 - this.pageTop;
		}
	},
	effectScrollAccelerated: function() {
		//webosEvent.event('', 'enyo:effectScrollAccelerated', '');
		var n = this.$.content.hasNode();
		if (n) {
			n.style.webkitTransform = 'translate3d(0,' + this.pageTop + 'px,0)';
		}
	}
});


//* @protected
enyo.kind({
	name: "CustomBufferedScroller",
	kind: "CustomVirtualScroller",
	rowsPerPage: 1,
	events: {
		onGenerateRow: "generateRow",
		onAdjustTop: "",
		onAdjustBottom: ""
	},
	//* @protected
	constructor: function() {
		this.pages = [];
		this.inherited(arguments);
	},
	create: function() {
		this.inherited(arguments);
		this.createDomBuffer();
		this.createDisplayBuffer();
	},
	createDomBuffer: function() {
		this.domBuffer = this.createComponent({
			kind: enyo.DomBuffer,
			rowsPerPage: this.rowsPerPage,
			pages: this.pages,
			margin: 20,
			generateRow: enyo.hitch(this, "doGenerateRow")
		});
	},
	createDisplayBuffer: function() {
		this.displayBuffer = new enyo.DisplayBuffer({
			heights: this.heights,
			pages: this.pages
		});
	},
	rendered: function() {
		this.domBuffer.pagesNode = this.$.content.hasNode();
		this.inherited(arguments);
	},
	pageToTopRow: function(inPage) {
		return inPage * this.rowsPerPage;
	},
	pageToBottomRow: function(inPage) {
		return inPage * this.rowsPerPage + (this.rowsPerPage - 1);
	},
	//* @public
	adjustTop: function(inTop) {
		this.doAdjustTop(this.pageToTopRow(inTop));
		if (this.domBuffer.adjustTop(inTop) === false) {
			return false;
		}
		this.displayBuffer.adjustTop(inTop);
	},
	adjustBottom: function(inBottom) {
		this.doAdjustBottom(this.pageToBottomRow(inBottom));
		if (this.domBuffer.adjustBottom(inBottom) === false) {
			return false;
		}
		this.displayBuffer.adjustBottom(inBottom);
	},
	findBottom: function() {
		while (this.pushPage() !== false) {};
		this.contentHeight = this.displayBuffer.height;
		var bb = Math.min(-this.contentHeight + this.pageOffset + this.viewHeight, -1);
		this.$.scroll.bottomBoundary = this.$.scroll.y = this.$.scroll.y0 = bb;
		this.scroll();
	},
	refreshPages: function() {
		// flush all DOM nodes
		this.domBuffer.flush();
		// domBuffer top/bottom are linked to scroller top/bottom because
		// scroller shiftPages/popPages rely on top/bottom referring to known
		// regions
		this.bottom = this.top - 1;
		this.displayBuffer.bottom = this.domBuffer.bottom = this.bottom;
		this.displayBuffer.top = this.domBuffer.top = this.top;
		// clear metrics
		this.contentHeight = 0;
		this.displayBuffer.height = 0;
		this.heights = this.displayBuffer.heights = [];
		// rebuild pages
		this.updatePages();
	},
	punt: function() {
		this.$.scroll.stop();
		this.bottom = -1;
		this.top = 0;
		this.domBuffer.flush();
		this.displayBuffer.bottom = this.domBuffer.bottom = this.bottom;
		this.displayBuffer.top = this.domBuffer.top = this.top;
		this.contentHeight = 0;
		this.displayBuffer.height = 0;
		this.heights = this.displayBuffer.heights = [];
		this.pageOffset = 0;
		this.pageTop = 0;
		this.$.scroll.y = this.$.scroll.y0 = 0;
		// rebuild pages
		this.updatePages();
	}
});

/**
	Manages a long list by rendering only small portions of the list at a time.
	Uses flyweight strategy via onSetupRow.
	We suggest users stick to the derived kind VirtualList instead.
	VirtualList introduces a paging strategy for backing data, but it can be 
	ignored if it's not needed.
*/
enyo.kind({
	name: "CustomScrollingList",
	kind: enyo.VFlexBox,
	events: {
		/** sent with arguments (inSender,inIndex) to ask owner to prepare the row with specificed index by 
			setting the properties of the objects in the list's components.  Return true if you should keep
			getting more onSetupRow events for more items. */
		onSetupRow: ""
	},
	rowsPerScrollerPage: 1,
	//* @protected
	controlParentName: "list",
	initComponents: function() {
		this.createComponents([
			{flex: 1, name: "scroller", kind: "CustomBufferedScroller", rowsPerPage: this.rowsPerScrollerPage, onGenerateRow: "generateRow", onAdjustTop: "adjustTop", onAdjustBottom: "adjustBottom", components: [
				{name: "list", kind: enyo.RowServer, onSetupRow: "setupRow"}
			]}
		]);
		this.inherited(arguments);
	},
	generateRow: function(inSender, inRow) {
		return this.$.list.generateRow(inRow);
	},
	setupRow: function(inSender, inRow) {
		return this.doSetupRow(inRow);
	},
	rendered: function() {
		this.inherited(arguments);
		// allow access to flyweight node after rendering or refreshing;
		// ensures, for example, that any dynamically added controls do not have 
		// a node access state out of sync with flyweight
		this.$.list.enableNodeAccess();
	},
	//* @public
	//* move the active index of the list to inIndex where it can be altered
	prepareRow: function(inIndex) {
		return this.$.list.prepareRow(inIndex);
	},
	//* indicate that a row has changed so the onSetupRow callback will be called for it
	updateRow: function(inIndex) {
		this.prepareRow(inIndex);
		this.setupRow(this, inIndex);
	},
	//* return the index of the active row
	fetchRowIndex: function() {
		return this.$.list.fetchRowIndex();
	},
	//* adjust rendering buffers to fit display
	update: function() {
		this.$.scroller.updatePages();
	},
	/** redraw any visible items in the list to reflect data changes without
		adjusting the list positition */
	refresh: function() {
		this.$.list.saveCurrentState();
		this.$.scroller.refreshPages();
		this.$.list.enableNodeAccess();
	},
	//* clear the list's internal state and refresh
	reset: function() {
		// dump state buffer
		this.$.list.clearState();
		// stop scroller animation
		this.$.scroller.$.scroll.stop();
		// dump and rebuild rendering buffers
		this.refresh();
	},
	//* completely reset the list so that it reloads all data and rerenders
	punt: function() {
		// dump state buffer
		this.$.list.clearState();
		// dump rendering buffers and locus data, rebuild from start state
		this.$.scroller.punt();
	}
});

enyo.kind({
	name: "CustomVirtualList",
	kind: "CustomScrollingList",
	published: {
		lookAhead: 2,
		pageSize: 10
	},
	events: {
		onAcquirePage: "",
		onDiscardPage: ""
	},
	//* @protected
	initComponents: function() {
		this.inherited(arguments);
		this.createComponents([
			{kind: "Selection", onClear: "selectionCleared", onDeselect: "updateRowSelection", onSelect: "updateRowSelection"},
			{kind: "Buffer", overbuffer: this.lookAhead, margin: 3, onAcquirePage: "doAcquirePage", onDiscardPage: "doDiscardPage"}
		]);
	},
	//* @public
	/** 
	 Set the selection state for the given row index. 
	*/
	select: function(inRowIndex, inData) {
		return this.$.selection.select(inRowIndex, inData);
	},
	/** 
	 Get the selection state for the given row index.
	*/
	isSelected: function(inRowIndex) {
		return this.$.selection.isSelected(inRowIndex);
	},
	/** 
	 Enable/disable multi-select mode
	*/
	setMultiSelect: function(inMulti) {
		this.$.selection.setMulti(inMulti);
		this.refresh();
	},
	/** 
	Returns the selection component (<a href="#enyo.Selection">enyo.Selection</a>) that manages the selection
	state for this list.
	*/
	getSelection: function() {
		return this.$.selection;
	},
	//* @protected
	updateRowSelection: function(inSender, inRowIndex) {
		this.updateRow(inRowIndex);
	},
	resizeHandler: function() {
		if (this.hasNode()) {
			//this.log();
			this.$.scroller.measure();
			// FIXME: if we refresh, then we always re-render the dom, which seems 
			// unncessary and over-aggressive.
			// if we merely update, then we don't blap away a rendering if list is hidden.
			// in addition, it's more compatible with controls that have a render-specific state like editors
			//this.update();
			this.refresh();
			this.$.scroller.start();
		} else {
			this.log("no node");
		}
	},
	//* @protected
	rowToPage: function(inRowIndex) {
		return Math.floor(inRowIndex / this.pageSize);
	},
	adjustTop: function(inSender, inTop) {
		var page = this.rowToPage(inTop);
		this.$.buffer.adjustTop(page);
	},
	adjustBottom: function(inSender, inBottom) {
		var page = this.rowToPage(inBottom);
		this.$.buffer.adjustBottom(page);
	},
	reset: function() {
		this.$.buffer.bottom = this.$.buffer.top - 1;
		this.inherited(arguments);
	},
	punt: function() {
		var b = this.$.buffer;
		// dump data buffer
		b.flush();
		b.top = b.specTop = 0;
		b.bottom = b.specBottom = -1;
		this.inherited(arguments);
	}
});

enyo.kind({
	name: "CustomBasicScroller",
	kind: "CustomDragScroller",
	published: {
		scrollTop: 0,
		scrollLeft: 0,
		/**
		Enables horizontal scrolling only if content exceeds the scroller's width.
		*/
		autoHorizontal: true,
		/**
		Enables vertical scrolling only if content exceeds the scroller's height.
		*/
		autoVertical: false,
		/**
		Display fps counter
		*/
		fpsShowing: false,
		/**
		Use accelerated scrolling.
		*/
		accelerated: true,
		scrim: true
	},
	events: {
		/**
		Event that fires when scrolling starts.
		*/
		onScrollStart: "",
		/**
		Event that fires just before scroll position changes.
		*/
		onBeforeScroll: "",
		/**
		Event that fires just after scroll position changes.
		*/
		onScroll: "",
		/**
		Event that fires when scrolling stops.
		*/
		onScrollStop: ""
	},
	className: "enyo-scroller",
	//* @protected
	
	scrimTools: [{kind: "Scrim",name: "scrim",animateShowing: false, style: "z-index: 1;", showing: false}],
	chrome: [
		{name: "client"}
	],
	create: function() {
		this.inherited(arguments);
		enyo.mixin(this.domAttributes, {
			onscroll: enyo.bubbler
		});
		this.fpsShowingChanged();
		this.acceleratedChanged();
		this.scrimChanged();
	},
	rendered: function() {
		this.inherited(arguments);
		// FIXME: use preventScrollAtRendered to bypass scroll simulation.
		// There are times that we just want to update the content by calling contentChanged() or render() but don't
		// want to get scroll events.
		// In general, we should fire scroll events only when user drags the scroll region, e.g. scroll start via drag.
		if (this.hasNode()/* && !this.preventScrollAtRendered*/) {
			enyo.asyncMethod(this.$.scroll, "start");
		}
	},
	scrimChanged: function() {
		if (this.scrim && !this.$.scrim) {
		this.makeScrim();
		}
		if (!this.scrim && this.$.scrim) {
		this.$.scrim.destroy();
		}
	},
	makeScrim: function() {
		// reset control parent so scrim doesn't go into client.
		/*var cp = this.parent;
		this.parent = null;*/
		this.createChrome(this.scrimTools);
		/*this.parent = cp;
		var cn = this.container.hasNode();
		// render scrim in container, strategy has no dom.
		console.error("CONTAIN NODE:" + cn + " cp: " + cp)
		if (cn) {
			console.error("CREATING SCRIM:")*/
		//this.$.scrim.parentNode = cn;
		this.$.scrim.render();
		//}
	},
	// we choose not to let reported offset be out of bounds
	// so when overscrolling, adjust offset to be reported as if it's in bounds
	calcControlOffset: function(inControl) {
		var o = this.inherited(arguments);
		if (this.$.scroll.isInOverScroll()) {
			// discount whatever current scroll position is
			o.left += this.scrollLeft;
			o.top += this.scrollTop;
			var b = this.getBoundaries();
			// add back checked scroll position
			o.left -= Math.max(b.left, Math.min(b.right, this.scrollLeft));
			o.top -= Math.max(b.top, Math.min(b.bottom, this.scrollTop));
		}
		return o;
	},
	scrollHandler: function(inSender, e) {
		// defeat dom scrolling
		if (this.hasNode()) {
			this.node.scrollTop = 0;
			this.node.scrollLeft = 0;
		}
	},
	resizeHandler: function() {
		// FIXME: file webkit bug...
		// Keep scroll position in bounds when bounds change due to resizing
		// can do this via this.start, but it's async; stabilize is sync.
		// We choose sync so that resize calculations that rely on offsets do not give
		// unexpected values while scrolling (e.g. keeping an input in view when
		// keyboard is up: device window.carectRect)
		//this.start();
		this.stabilize();
		this.inherited(arguments);
	},
	locateScrollee: function() {
		return this.$.client;
	},
	setScrollee: function(inScrollee) {
		if (this.scrollee)  {
			this.scrollee.removeClass("enyo-scroller-scrollee");
		}
		// FIXME: temporary warning for this especially bad case.
		if (!inScrollee) {
			this.log("Setting null scrollee");
		}
		this.scrollee = inScrollee;
		this.scrollee.addClass("enyo-scroller-scrollee");
	},
	flow: function() {
		// NOTE: this is ad hoc, but seems like a reasonable place to setScrollee
		this.setScrollee(this.locateScrollee());
		this.layoutKindChanged();
		this.inherited(arguments);
	},
	layoutKindChanged: function() {
		if (this.$.client) {
			this.$.client.setLayoutKind(this.layoutKind);
		}
	},
	showingChanged: function() {
		this.inherited(arguments);
		if (this.showing) {
			enyo.asyncMethod(this, this.start);
		}
	},
	fpsShowingChanged: function() {
		if (!this.$.fps && this.fpsShowing) {
			this.createChrome([{name: "fps", content: "stopped", className: "enyo-scroller-fps", parent: this}]);
			if (this.generated) {
				this.$.fps.render();
			}
		}
		if (this.$.fps) {
			this.$.fps.setShowing(this.fpsShowing);
		}
	},
	acceleratedChanged: function() {
		var p = {top: this.scrollTop, left: this.scrollLeft};
		this.scrollTop = 0;
		this.scrollLeft = 0;
		if (this.effectScroll) {
			this.effectScroll();
		}
		this.scrollTop = p.top;
		this.scrollLeft = p.left;
		this.effectScroll = this.accelerated ? this.effectScrollAccelerated : this.effectScrollNonAccelerated;
		this.effectScroll();
	},
	start: function() {
		if (this.scrim) {
			this.$.scrim.show();
			}
		this.$.scroll.start();
		
	},
	stop: function() {
		if (this.isScrolling()) {
			// do not allow scroller to be stopped out of bounds
			// by stabilizing if we're overscrolling
			var o = this.$.scroll.isInOverScroll();
			this.$.scroll.stop();
			if (o) {
				this.stabilize();
			}
		}
		if (this.scrim ) {
			this.$.scrim.hide();
			}
	},
	dragstartHandler: function(inSender, inEvent) {
		this.calcBoundaries();
		this.calcAutoScrolling();
		return this.inherited(arguments);
	},
	dragHandler: function(inSender, inEvent) {
		if (this.dragging) {
			if (this.scrim) {
				this.$.scrim.show();
			}
		}
		return this.inherited(arguments);
	},
	dragfinishHandler: function(inSender, inEvent) {
		if (this.dragging) {
		
		if (this.scrim && this.isScrolling() == false) {
		this.$.scrim.hide();
		}
		}
		return this.inherited(arguments);
	},
	// this event comes from the 'scroll' object, it is fired
	// by start() call above, and also when user starts a drag interaction
	scrollStart: function(inSender) {
		this.calcBoundaries();
		this.calcAutoScrolling();
		this.scrollLeftStart = this.scrollLeft;
		this.scrollTopStart = this.scrollTop;
		this.doScrollStart();
	},
	scroll: function(inSender) {
		this.scrollLeft = -inSender.x;
		this.scrollTop = -inSender.y;
		this.doBeforeScroll();
		this.effectScroll();
		this.doScroll();
	},
	scrollStop: function(inSender) {
		if (this.fpsShowing) {
			this.$.fps.setContent(inSender.fps);
		}
		// NOTE: after a scroller stops some controls may need to reposition themselves, e.g. popup
		// send an offsetChanged message if our scroll position is changed.
		if (this.needsOffsetBroadcast || (this.scrollLeft != this.scrollLeftStart || this.scrollTop != this.scrollTopStart)) {
			this.broadcastToControls("offsetChanged");
			this.needsOffsetBroadcast = false;
		}
		if (this.scrim ) {
			this.$.scrim.hide();
			}
		this.doScrollStop();
	},
	effectScrollAccelerated: function() {
		if (this.scrollee && this.scrollee.hasNode()) {
			// NOTE: optimization, avoid using applyStyle which sets node cssText and instead set individual property.
			var s = this.scrollee.node.style;
			var ds = this.scrollee.domStyles;
			// Scroll via transform: fastest when accelerated, slowest when not
			var m = -this.scrollLeft + "px, " + -this.scrollTop + "px";
			// NOTE: translate3d prompts acceleration witout need for -webkit-transform-style: preserve-3d; style
			ds["-webkit-transform"] = s.webkitTransform = "translate3d(" + m + ",0)";
		}
	},
	effectScrollNonAccelerated: function() {
		if (this.scrollee && this.scrollee.hasNode()) {
			// NOTE: optimization, avoid using applyStyle which sets node cssText and instead set individual property.
			var s = this.scrollee.node.style;
			var ds = this.scrollee.domStyles;
			// Scroll via top: faster than transform when unaccelerated.
			// NOTE: round DOM positions for readability, review when/if webkit does some intelligent with fractional positions
			ds.top = s.top = -Math.round(this.scrollTop) + "px";
			ds.left = s.left = -Math.round(this.scrollLeft) + "px";
		}
	},
	calcBoundaries: function() {
		var sn = this.scrollee && this.scrollee.hasNode();
		if (sn && this.hasNode()) {
			// NOTE: it makes most sense to calculate our scroll h/w by asking for the scroll h/w of the parent (client) node 
			// of our scrolling content (scrollee) node [note: only Scroller has this relationship]
			// However, (non-accelerated) scrolling scrollee via top/left alters the parent's scroll h/w
			// Also when scrolling scrollee via webkitTransform (accelerated) and the client is position: absolute,
			// scrolling inexplicably alters the parent's scroll h/w (this seems to violate known transform rules).
			// So instead, we use scrollee's scroll h/w.
			// This is off by scrollee's border and margin.
			// Add border via offsetHeight - clientHeight.
			// Add margin via offsetTop. This includes margin + top, so compensate for top when we scroll using top. 
			//
			// calculate margin adjustment.
			var mh = sn.offsetTop;
			var mw = sn.offsetLeft;
			if (!this.accelerated) {
				mh += this.scrollTop;
				mw += this.scrollLeft;
			}
			// scroll h/w + (margin) + (border)
			var h = sn.scrollHeight + mh + (sn.offsetHeight - sn.clientHeight);
			var w = sn.scrollWidth + mw + (sn.offsetWidth - sn.clientWidth)
			var bounds = {
				b: Math.min(0, this.node.clientHeight - h),
				r: Math.min(0, this.node.clientWidth - w)
			}
			this.adjustBoundaries(bounds);
			this.$.scroll.bottomBoundary = bounds.b;
			this.$.scroll.rightBoundary = bounds.r;
		}
	},
	adjustBoundaries: function(inBounds) {
		// allow content to be visible when underneath a region floating over it
		// by adjusting bottom boundary by amount of scroller region that's not visible.
		//
		// FIXME: need a better name (calcModalControlBounds)
		var vb = enyo.calcModalControlBounds(this);
		var b = this.getBounds();
		inBounds.b -= Math.max(0, b.height - vb.height);
	},
	calcAutoScrolling: function() {
		// auto-detect if we should scroll
		if (this.autoHorizontal) {
			this.setHorizontal(this.$.scroll.rightBoundary !== 0);
		}
		if (this.autoVertical) {
			this.setVertical(this.$.scroll.bottomBoundary !== 0);
		}
	},
	scrollLeftChanged: function() {
		var s = this.$.scroll;
		s.x = s.x0 = -this.scrollLeft;
		if (this.scrollee) {
			// FIXME: flag needed due to direct setting of scrollLeft/Top
			this.needsOffsetBroadcast = true;
			this.start();
		}
	},
	scrollTopChanged: function() {
		var s = this.$.scroll;
		s.y = s.y0 = -this.scrollTop;
		if (this.scrollee) {
			this.needsOffsetBroadcast = true;
			this.start();
		}
	},
	// synchronously ensure a valid scroll position.
	stabilize: function() {
		// get an in bounds position
		this.calcBoundaries();
		var s = this.$.scroll;
		var y = Math.min(s.topBoundary, Math.max(s.bottomBoundary, s.y));
		var x = Math.min(s.leftBoundary, Math.max(s.rightBoundary, s.x));
		// IFF needed, sync scroll to an in bounds position
		if (y != s.y || x != s.x) {
			s.y = s.y0 = y;
			s.x = s.x0 = x;
			this.scrollStart(s);
			this.scroll(s);
			this.scrollStop(s);
		}
	},
	setScrollPositionDirect: function(inX, inY) {
		this.scrollTop = inY;
		this.scrollLeft = inX;
		// update ScrollStrategy positions
		var s = this.$.scroll;
		s.y = s.y0 = -this.scrollTop;
		s.x = s.x0 = -this.scrollLeft;
		this.effectScroll();
	},
	//* @public
	//* Returns true if the scroller is scrolling when called.
	isScrolling: function() {
		return this.$.scroll.isScrolling();
	},
	/**
	Returns an object describing the scroll boundaries, which are the dimensions
	of scrolling content. For example, if getBoundaries returns

		{top: 0, left: 0, bottom: 1000, left: 1000}

	then the scrolling content is 1000 by 1000.
	*/
	getBoundaries: function() {
		this.calcBoundaries();
		var s = this.$.scroll;
		return {top: s.topBoundary, right: -s.rightBoundary, bottom: -s.bottomBoundary, left: s.leftBoundary};
	},
	// NOTE: Yip/Orvell method for determining scroller instantaneous velocity
	// FIXME: should probably be in ScrollStrategy.
	// FIXME: incorrect if called when scroller is in overscroll region
	// because does not account for additional overscroll damping.
	/**
	Animates a scroll to the specified position.
	*/
	scrollTo: function(inY, inX) {
		var s = this.$.scroll;
		// note: choosing to not use !== so that we catch null and undefined)
		
		if (inY != null) {
			s.y = s.y0 - (inY + s.y0) * (1 - s.kFrictionDamping);
		}
		if (inX != null) {
			s.x = s.x0 - (inX + s.x0) * (1 - s.kFrictionDamping);

		}
		s.start();
	},
	/**
	Ensures that the specified position is displayed in the viewport.
	If the position is not currently in view, the specified position
	is scrolled to directly, without animation.
	*/
	scrollIntoView: function(inY, inX) {
		if (this.hasNode()) {
			this.stop();
			var b = this.getBoundaries();
			var h = this.node.clientHeight;
			var w = this.node.clientWidth;
			if ((inY < this.scrollTop) || (inY > this.scrollTop + h)) {
				this.setScrollTop(Math.max(b.top, Math.min(b.bottom, inY)));
			}
			if ((inX < this.scrollLeft) || (inX > this.scrollLeft + w)) {
				this.setScrollLeft(Math.max(b.left, Math.min(b.right, inX)));
			}
		}
		// FIXME: should only be necessary to ensure a no-op move keeps the scroller in bounds
		// which should not be necessary. can we remove this?
		this.start();
	},
	//* @protected
	scrollOffsetIntoView: function(inY, inX, inHeight) {
		if (this.hasNode()) {
			this.stop();
			var b = enyo.calcModalControlBounds(this);
			b.bottom = b.top + b.height;
			b.right = b.left + b.width;
			if (inY != undefined) {
				// add some sluff!!
				var sluff = 10;
				b.top += sluff;
				b.bottom -= (inHeight || 0) + sluff;
				if (inY < b.top) {
					this.setScrollTop(this.scrollTop + inY - b.top);
				} else if (inY > b.bottom) {
					this.setScrollTop(this.scrollTop + inY - b.bottom);
				}
			}
			if (inX != undefined) {
				if (inX < b.left) {
					this.setScrollLeft(this.scrollLeft + inX - b.left);
				} else if (inX > b.right) {
					this.setScrollLeft(this.scrollLeft + inX - b.right);
				}
			}
			this.start();
		}
	},
	//* @public
	/**
	Sets the scroll position to the bottom of the content, without animation.
	*/
	scrollToBottom: function() {
		this.scrollIntoView(9e6, 0);
	}
});

enyo.kind({
name: "CustomSnapScroller",
kind: "CustomBasicScroller",
published: {
/**
Sets index to scroll directly (without animation) to the position of the
control in scroller's list of controls at the value of index.
*/
index: 0
},
events: {
/**
Event that fires when the user finishes dragging and snapping occurs.
*/
onSnap: "",
/**
Event that fires when snapping and scroller animation completes.
*/
onSnapFinish: "",
onOverScrolled: ""
},
//* @protected
layoutKind: "HFlexLayout",
dragSnapWidth: 10,
// experimental
revealAmount: 0,
//
create: function() {
this.inherited(arguments);
// adjust scroll friction
this.setFriction();

},
setFriction: function() {
	if (!ISPHONE) {
		this.$.scroll.kFrictionDamping = 0.55;
	}
	else {
		this.$.scroll.kFrictionDamping = 0.75;
	}
},
layoutKindChanged: function() {
this.inherited(arguments);
this.scrollH = (this.layoutKind == "HFlexLayout") || (this.layoutKind === enyo.HFlexLayout);
var p = this.revealAmount + "px";
this.$.client.applyStyle("padding", this.scrollH ? "0 "+p : p+" 0");
},
indexChanged: function() {
var p = this.calcPos(this.index);
if (p !== undefined) {
this.scrollToDirect(p);
}
},
getCurrentPos: function() {
return this.scrollH ? this.getScrollLeft() : this.getScrollTop();
},
scrollStart: function() {
this.inherited(arguments);
this.startPos = this.getCurrentPos();
},
scroll: function(inSender) {
this.inherited(arguments);
this.pos = this.getCurrentPos();
// determine swipe prev or next
this.goPrev = this.pos0 != this.pos ? this.pos0 > this.pos : this.goPrev;
if (this.isInOverScroll && this.pos > 0) {
	this.doOverScrolled()
}
	if (this.dragging) {
		this.snapable = true;
	} else if (this.snapable && this.startPos !== this.pos) {
		var bs = this.getBoundaries();
		if (this.pos > bs[this.scrollH ? "left" : "top"] && this.pos < bs[this.scrollH ? "right" : "bottom"]) {
			this.snapable = false;
			// within the scroll boundaries, e.g. not in overscroll
			this.snap();
		} else {

			if (this.pos < bs.left) {
			
				//this.snapTo(0)
			}
			else {
				//this.scrollToDirect(bs.right)	
				
			}
		}
	} else if (!this.snapping) {
		this.snapable = true;
	}
	this.pos0 = this.pos;
},
scrollStop: function() {
	//console.error("SCROLLSTOP1")
	enyo.scrim.hide();
if (this.snapping) {
this.snapping = false;
if (this.index != this.oldIndex) {
// scroll animation may not scroll to the exact pos, e.g. 1073 vs 1072.733952370556
// force to scoll exactly to the exact pos
var p = this.getCurrentPos();
//this.error(this.snapPos + ", " + p)
if ((this.snapPos != p && Math.abs(this.snapPos - p) < 1) || !ISPHONE) {
this.scrollToDirect(this.snapPos);
//console.error("SCROLLSTOP2")
}
this.snapFinish();
}
this.inherited(arguments);
}
},
snapFinish: function() {
//enyo.scrim.hide();
this.doSnapFinish();
},
snapScrollTo: function(inPos) {
this.snapPos = inPos;
this.pos = inPos;
this.snapping = true;
this.snapable = false;
if (this.scrollH) {
this.scrollTo(0, inPos);
} else {
this.scrollTo(inPos, 0);
}
//this.scrollToDirect(this.snapPos);
},
scrollToDirect: function(inPos) {
this.calcBoundaries();
this.stop();
this.pos = inPos;
if (this.scrollH) {
this.setScrollPositionDirect(inPos, 0);
} else {
this.setScrollPositionDirect(0, inPos);
}
},
// FIXME: may need a better test for which control to snap to, probably based on what
// direction you moved and how far from a snap edge you are.
calcSnapScroll: function() {
for (var i=0, c$ = this.getControls(), c, p; c=c$[i]; i++) {
p = c.hasNode()["offset" + (this.scrollH ? "Left" : "Top")] - this.revealAmount;
if (this.pos < p) {
var l = this.scrollH ? c.hasNode().clientWidth : c.hasNode().clientHeight;
var passMargin = Math.abs(this.pos + (this.goPrev ? 0 : l) - p) > this.dragSnapWidth;
if (passMargin) {
return this.goPrev ? i-1 : i;
} else {
return this.index;
}
}
}
},
calcPos: function(inIndex) {
var c = this.getControls()[inIndex];
if (c && c.hasNode()) {
return c.hasNode()["offset" + (this.scrollH ? "Left" : "Top")] - this.revealAmount;
}
},
snap: function() {
var i = this.calcSnapScroll();
if (i !== undefined) {
	//enyo.scrim.show();
this.snapTo(i);
}
},
//* @public
/**
Scrolls to the position of the control contained in the scroller's list of controls at inIndex.
*/
snapTo: function(inIndex, direct) {
this.oldIndex = this.index;
var p = this.calcPos(inIndex);
if (p !== undefined) {
this.index = inIndex;
if (!direct) {
	this.snapScrollTo(p);	
}
else {
	this.scrollToDirect(p);
}
if (this.index != this.oldIndex) {
this.doSnap(inIndex);
}
}
},
jitter: function() {
	this.stabilize();
},
/**
Scrolls to the control preceding (left or top) the one currently in view.
*/
previous: function() {
!this.snapping && this.snapTo(this.index-1);
},
/**
Scrolls to the control following (right or bottom) the one currently in view.
*/
next: function() {
!this.snapping && this.snapTo(this.index+1);
}
});

enyo.kind({
	name: "CustomMenu",
	kind: enyo.Popup,
	published: {
		// whenever the menu is opened, any sub-items will be shown closed
		autoCloseSubItems: true
	},
	modal: true,
	showFades: true,
	className: "enyo-popup enyo-popup-menu",
	chrome: [
		{name: "client", className: "enyo-menu-inner", kind: "CustomBasicScroller", onScroll: "scrollerScroll", autoVertical: true, vertical: false, layoutKind: "OrderedLayout"}
	],
	defaultKind: "MenuItem",
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.styleLastItem();
		if (this.showFades) {
			this.createChrome([{kind: "ScrollFades", className: "enyo-menu-scroll-fades", topFadeClassName: "enyo-menu-top-fade", bottomFadeClassName: "enyo-menu-bottom-fade", leftFadeClassName: "", rightFadeClassName: ""}]);
		}
	},
	removeControl: function(inControl) {
		this.inherited(arguments);
		if (inControl == this._lastItem) {
			this._lastItem = null;
		}
	},
	destroyControls: function() {
		this._lastItem = null;
		this.inherited(arguments);
	},
	showingChanged: function() {
		if (this.showing) {
			if (this.autoCloseSubItems) {
				for (var i=0, c$=this.getControls(), c; c=c$[i]; i++) {
					enyo.call(c, "closeAll");
				}
			}
		}
		this.inherited(arguments);
	},
	scrollerScroll: function() {
		this.$.scrollFades && this.$.scrollFades.showHideFades(this.$.client);
	},
	fetchItemByValue: function(inValue) {
		var items = this.getControls();
		for (var i=0, c; c=items[i]; i++) {
			if (c.getValue && c.getValue() == inValue) {
				return c;
			}
		}
	},
	scrollIntoView: function(inY, inX) {
		this.$.client.scrollIntoView(inY, inX);
		this.$.client.calcAutoScrolling();
	},
	flow: function() {
		this.inherited(arguments);
		this.styleLastItem();
	},
	_locateLastItem: function(inControl) {
		if (inControl.getOpen && !inControl.getOpen()) {
			return inControl;
		} else {
			var controls = inControl.getControls();
			var c = controls.length;
			return c ? this._locateLastItem(controls[c-1]) : inControl;
		}
	},
	locateLastItem: function() {
		return this._locateLastItem(this);
	},
	// NOTE: dynamically style the very bottom visible menu item
	// this is so that we can make sure to hide any bottom border.
	styleLastItem: function() {
		if (this._lastItem && !this._lastItem.destroyed) {
			this._lastItem.addRemoveMenuLastStyle(false);
		}
		var b = this.locateLastItem();
		if (b && b.addRemoveMenuLastStyle) {
			b.addRemoveMenuLastStyle(true);
			this._lastItem = b;
		}
	}
});

/**
A <a href="#enyo.Menu">Menu</a> with support for selection.

	{kind: "PopupSelect", onSelect: "popupSelect"}

The onSelect event is fired when a selection is made, like so:

	popupSelect: function(inSender, inSelected) {
		var value = inSelected.getValue();
	}
*/
enyo.kind({
	name: "CustomPopupSelect",
	kind: "CustomMenu",
	published: {
		/**
		An array of config objects or strings representing items. Note, specified components are 
		automatically added to the items array.
		Items are owned by the PopupSelect and therefore event handlers should not be specified on them.
		Use the onSelect event to respond to an item selection.
		*/
		items: [],
		selected: null
	},
	events: {
		onSelect: ""
	},
	className: "enyo-popup enyo-popup-menu enyo-popupselect",
	canCreateItems: false,
	//* @protected
	importProps: function(inProps) {
		if (inProps.components) {
			inProps.items = inProps.items ? inProps.items.concat(inProps.components) : inProps.components;
			inProps.components = [];
		}
		this.inherited(arguments);
	},
	componentsReady: function() {
		this.inherited(arguments);
		this.canCreateItems = true;
		this.itemsChanged();
	},
	// NOTE: default MenuItem.onclick
	menuItemClick: function(inSender) {
		this._itemClicked = true;
		this.setSelected(inSender);
	},
	itemsChanged: function() {
		this.selected = null;
		if (this.canCreateItems) {
			this.createItems();
		}
	},
	createItems: function() {
		this.destroyControls();
		for (var i=0, item, c; item=this.items[i]; i++) {
			item = enyo.isString(item) ? {caption: item} : item;
			// we want these controls to be owned by us so we get events
			this.createComponent(item);
		}
		if (this.generated) {
			this.render();
		}
		this.hasItems = true;
	},
	selectedChanged: function(inOldValue) {
		enyo.call(this.selected, "setSelected", [true]);
		if (inOldValue != this.selected) {
			enyo.call(inOldValue, "setSelected", [false]);
		}
		if (this._itemClicked) {
			this._itemClicked = false;
			this.doSelect(this.selected, inOldValue);

		}
	},
	fetchItemByValue: function(inValue) {
		return !this.hasItems ? this.fetchItemDataByValue(inValue) : this.inherited(arguments);
	},
	fetchItemDataByValue: function(inValue) {
		for (var i=0, items=this.items, c; c=items[i]; i++) {
			c.value = c.value || c.caption;
			if (c.value == inValue) {
				return c;
			}
		}
	},
	scrollToSelected: function() {
		var b = this.selected.getBounds();
		this.scrollIntoView(b.top);
	}
});
var ISPHONE = true

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
kSpringDamping: .93,
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
		vx=vx*2
		vy=vy*2
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
		accelerated: true
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
	},
	dragstartHandler: function(inSender, inEvent) {
		this.calcBoundaries();
		this.calcAutoScrolling();
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
	if (ISPHONE) {
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
if (this.snapping) {
this.snapping = false;
if (this.index != this.oldIndex) {
// scroll animation may not scroll to the exact pos, e.g. 1073 vs 1072.733952370556
// force to scoll exactly to the exact pos
var p = this.getCurrentPos();
//this.error(this.snapPos + ", " + p)
if ((this.snapPos != p && Math.abs(this.snapPos - p) < 1) || ISPHONE) {
this.scrollToDirect(this.snapPos);
//console.error("SCROLLSTOP2")
}
this.snapFinish();
}
this.inherited(arguments);
}
},
snapFinish: function() {
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

/**
A control that provides the ability to slide back and forth between different views.
If you have many views in the carousel, use <a href="#enyo.Carousel">Carousel</a>.

	{kind: "BasicCarousel", flex: 1, components: [
		{kind: "View1"},
		{kind: "View2"},
		{kind: "View3"}
	]}

The default orientation of BasicCarousel is horizontal.  You can change to vertical by setting <code>layoutKind</code> to "VFlexLayout".

	{kind: "BasicCarousel", layoutKind: "VFlexLayout", flex: 1, components: [
		{kind: "View1"},
		{kind: "View2"},
		{kind: "View3"}
	]}
*/
enyo.kind({
	name: "CustomBasicCarousel",
	kind: "CustomSnapScroller",
	published: {
		views: [],
		dragSnapThreshold: 0.01
	},
	//
	chrome: [
		{name: "client", kind: "Control"/*, style: "position: absolute;"*/}
	],
	//* @protected
	create: function(inProps) {
		var components = [];
		if (inProps) {
			components = inProps.components;
			delete inProps.components;
		}
		components = components || this.kindComponents || [];
		this.inherited(arguments);
		this.$.scroll.kFrictionDamping = 0.75;
		this.$.scroll.kSpringDamping = 0.8;
		this.$.scroll.kFrictionEpsilon = 0.1;
		this.views = this.views.length ? this.views : components;
		this.viewsChanged();
	},
	rendered: function() {
		this.inherited(arguments);
		this.resize();
		this.dragSnapThresholdChanged();
	},
	layoutKindChanged: function() {
		this.inherited(arguments);
		this.setVertical(!this.scrollH);
		this.setHorizontal(this.scrollH);
	},
	dragSnapThresholdChanged: function() {
		this.dragSnapWidth = (this.scrollH ? this._controlSize.width : this._controlSize.height) * this.dragSnapThreshold;
	},
	dragstartHandler: function() {
		if (this.snapping || this.dragging) {
			// the next view is not ready so we don't want to let user to drag but also want to prevent click
			this._preventClick = true;
			return this.preventDragPropagation;
		}
		return this.inherited(arguments);
	},
	dragfinishHandler: function(inSender, inEvent) {
		if (this._preventClick) {
			this._preventClick = false;
			inEvent.preventClick();
		}
		this.inherited(arguments);
	},
	flickHandler: function(inSender, e) {
		if (this.snapping) {
			return this.preventDragPropagation;
		}
		return this.inherited(arguments);
	},
	viewsChanged: function() {
		this.destroyControls();
		this.createViews(this.views);
		if (this.generated) {
			this.render();
		}
	},
	createViews: function(inViews) {
		for (var i=0, v; v=inViews[i]; i++) {
			this.createView(this, v);
		}
	},
	createView: function(inManger, inInfo, inMoreInfo) {
		var info = enyo.mixin(this.constructViewInfo(inInfo), inMoreInfo);
		var c = inManger.createComponent(info);
		enyo.call(c, "setOuterScroller", [this]);
		return c;
	},
	constructViewInfo: function(inInfo) {
		return enyo.isString(inInfo) ? {src: inInfo} : inInfo;
	},
	//* @public
	/**
	 Adds additional views to the carousel.
	 @param {Object} inViews
	 */
	addViews: function(inViews) {
		this.views = this.views.concat(inViews);
		this.createViews(inViews);
		this.contentChanged();
	},
	/**
	 Event handler for resize; if we're the root component, we'll automatically resize.
	 */
	resizeHandler: function() {
		this.resize();
		// we don't want to inherit resizeHandler from BasicScroller here since
		// resizeHandler in BasicScroller calls start() which may change the scroll pos and thus
		// causing a snap to occur.
		this.broadcastToControls("resize");
	},
	/**
	 Handles size changes.  This method can be hooked up to a resizeHandler.
	 */
	resize: function() {
		this.sizeControls("100%", "100%");
		this.measureControlSize();
		this._controlSize[this.scrollH ? "width" : "height"] = this._controlSize[this.scrollH ? "width" : "height"] - 2*this.revealAmount;
		this.sizeControls(this._controlSize.width+"px", this._controlSize.height+"px", true);
		// don't need to adjust the index since it is already adjusting
		if (!this.snapping) {
			this.setIndex(this.index);
		}
	},
	//* @protected
	measureControlSize: function() {
		this._controlSize = this.getBounds();
		// FIXME: in case there is no size for this, try to get the next available size.
		if (!this._controlSize.width || !this._controlSize.height) {
			var cs = enyo.fetchControlSize(this);
			this._controlSize = {width: cs.w, height: cs.h};
		}
	},
	sizeControls: function(inWidth, inHeight, inReset) {
		for (var i=0, c$=this.getControls(), c; c=c$[i]; i++) {
			inWidth && c.applyStyle("width", inWidth);
			inHeight && c.applyStyle("height", inHeight);
			inReset && this.resetView(i);
		}
	},
	calcPos: function(inIndex) {
		if (!this.getControls()[inIndex]) {
			return;
		}
		var pos = 0, s = this._controlSize[this.scrollH ? "width" : "height"];
		for (var i=0, c$=this.getControls(), c; (i<inIndex) && (c=c$[i]); i++) {
			if (c.showing) {
				pos += s;
			}
		}
		return pos;
	},
	snapFinish: function() {
		this.resetView(this.oldIndex);
		this.inherited(arguments);
	},
	snapTo: function(inIndex) {
		this.inherited(arguments);
		// make sure the center item is reset
		if (this.index != this.oldIndex) {
			this.resetView(this.index);
		}
	},
	findView: function(inControl) {
		return inControl;
	},
	applyToView: function(inControl, inMethod, inArgs) {
		var v = inControl[inMethod] ? inControl : this.findView(inControl);
		enyo.call(v, inMethod, inArgs);
	},
	resetView: function(inIndex) {
		var c = this.getControls()[inIndex];
		if (c) {
			this.applyToView(c, "reset", []);
		}
	}
});

enyo.kind({
	name: "CustomCarouselInternal",
	kind: "CustomBasicCarousel",
	components: [
		{name: "left", kind: "Control"},
		{name: "center", kind: "Control"},
		{name: "right", kind: "Control"}
	],
	centerIndex: 1,
	/**
	 Fetches the view corresponding to the view position "center", "left" or "right".
	 "center" would always refer to the view currently displayed.  "left" and "right" would be the left/right of currently displayed.
	 Use this function to update the view already being shown.
	 @param {String} position of the view to be fetched.  Possible values are "center", "left" or "right".
	 */
	fetchView: function(inViewPos) {
		var vm = {left: 0, center: 1, right: 2};
		var i = vm[inViewPos];
		i = this.index === 0 ? i-1 : (this.index == 2 ? i+1 : i);
		var c = this.getControls()[i];
		return c ? this.findView(c) : null;
	},
	/**
	 Returns the currently displayed view.
	 */
	fetchCurrentView: function() {
		return this.fetchView("center");
	},
	//* @protected
	newView: function(inViewHolder, inInfo, inRender) {
		inViewHolder.setShowing(inInfo ? true : false);
		if (inInfo) {
			inViewHolder.destroyControls();
			this.createView(inViewHolder, inInfo, {
				kind: inInfo.kind || this.defaultKind, owner: this.owner, width: "100%", height: "100%", accelerated: this.accelerated
			});
			inRender && inViewHolder.render();
		}
	},
	moveView: function(inViewHolder, inView) {
		if (!inViewHolder.showing) {
			inViewHolder.show();
		}
		inView.setContainer(inViewHolder);
		inView.setParent(inViewHolder);
	},
	findView: function(inControl) {
		var c = inControl.getControls();
		if (c.length) {
			return c[0];
		}
	},
	scrollStop: function() {
		this.inherited(arguments);
		if (!this._controlSize) {
			return;
		}
		var s = this.scrollH ? this._controlSize.width : this._controlSize.height;
		if (this.startPos && (this.pos >= this.startPos + s || this.pos <= this.startPos - s) && this.index == 1 && this.oldIndex == this.index) {
			// scroll pass the next view so need to trigger snapFinish manually
			this.index = this.index + (this.startPos < this.pos ? 1 : -1);
			this.snapFinish();
		}
	},
	snapFinish: function() {
		this.adjustViews();
		this.inherited(arguments);
	},
	previous: function() {
		if (this.index !== 1 || this.$.left.showing) {
			this.inherited(arguments);
		}
	},
	next: function() {
		if (this.index !== 1 || this.$.right.showing) {
			this.inherited(arguments);
		}
	}
});

/**
A control that provides the ability to slide back and forth between different views without having to load all the views initially.

A single carousel could contain thousands of views/images.  Loading all of them into memory at once would not be feasible.
Carousel solves this problem by only holding onto the center view (C), the previous view (P), and the next view (N).
Additional views are loaded as the user flips through the items in the Carousel.

	| 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
	              P   C   N

To initialize a carousel:

	{kind: "Carousel", flex: 1, onGetLeft: "getLeft", onGetRight: "getRight"}

Use <code>setCenterView</code> to set the center view, and the <code>onGetLeft</code> and <code>onGetRight</code> events to build a scrolling list of views.

	create: function() {
		this.inherited(arguments);
		this.$.carousel.setCenterView(this.getView(this.index));
	},
	getView: function(inIndex) {
		return {kind: "HFlexBox", align: "center", pack: "center", content: inIndex};
	},
	getLeft: function(inSender, inSnap) {
		inSnap && this.index--;
		return this.getView(this.index-1);
	},
	getRight: function(inSender, inSnap) {
		inSnap && this.index++;
		return this.getView(this.index+1);
	}
*/
enyo.kind({
	name: "CustomCarousel",
	kind: "CustomCarouselInternal",
	events: {
		/**
		 Gets the left view and also indicates if it is fired after a left transition.
		 */
		onGetLeft: "",
		/**
		 Gets the right view and also indicates if it is fired after a right transition.
		 */
		onGetRight: ""
	},
	/**
	 Sets the view to be used as the center view.
	 This function will create the center view and fires events onGetLeft and onGetRight to get the view infos
	 for creating left and right views.
	 @param {Object} inInfo A config block describing the view control.
	 */
	setCenterView: function(inInfo) {
		this.newView(this.$.left, this.doGetLeft(false));
		this.newView(this.$.center, inInfo);
		this.newView(this.$.right, this.doGetRight(false));
		this.index = this.centerIndex;
		if (this.hasNode()) {
			this.render();
		}
	},
	//* @protected
	adjustViews: function() {
		var goRight = this.index > this.oldIndex, src;
		if (this.index != this.centerIndex || !this._info) {
			this._info = this["doGet" + (goRight ? "Right" : "Left")](true);
		}
		if (this.index != this.centerIndex) {
			if (this._info) {
				var vh1 = goRight ? this.$.right : this.$.left;
				var vh2 = goRight ? this.$.left : this.$.right;
				var v = this.findView(this.$.center);
				this.moveView(this.$.center, this.findView(vh1));
				this.newView(vh1, this._info, true);
				vh2.destroyControls();
				this.moveView(vh2, v);
				this.setIndex(this.centerIndex);
			}
		}
	}
});

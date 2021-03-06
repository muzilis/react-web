/**
 * Copyright (c) 2015-present, Alibaba Group Holding Limited.
 * All rights reserved.
 *
 * Copyright (c) 2015, Facebook, Inc.  All rights reserved.
 *
 * @providesModule ReactTouchableBounce
 */
'use strict';

import Animated from 'ReactAnimated';
import React from 'react';
import { Mixin as TouchableMixin } from 'ReactTouchable';
import mixin from 'react-mixin';
import autobind from 'autobind-decorator';

type Event = Object;
type State = {
  animationID: ?number;
};

/**
 * When the scroll view is disabled, this defines how far your touch may move
 * off of the button, before deactivating the button. Once deactivated, try
 * moving it back and you'll see that the button is once again reactivated!
 * Move it back and forth several times while the scroll view is disabled.
 */
var PRESS_RECT_OFFSET = {top: 20, left: 20, right: 20, bottom: 30};
/**
 * Example of using the `TouchableMixin` to play well with other responder
 * locking views including `ScrollView`. `TouchableMixin` provides touchable
 * hooks (`this.touchableHandle*`) that we forward events to. In turn,
 * `TouchableMixin` expects us to implement some abstract methods to handle
 * interesting interactions such as `handleTouchablePress`.
 */
class TouchableBounce extends React.Component {

  static propTypes = {
    onPress: React.PropTypes.func,
    onPressIn: React.PropTypes.func,
    onPressOut: React.PropTypes.func,
    // The function passed takes a callback to start the animation which should
    // be run after this onPress handler is done. You can use this (for example)
    // to update UI before starting the animation.
    onPressWithCompletion: React.PropTypes.func,
    // the function passed is called after the animation is complete
    onPressAnimationComplete: React.PropTypes.func,
  }

  state = {
    ...this.touchableGetInitialState(),
    scale: new Animated.Value(1),
  }

  bounceTo(
    value: number,
    velocity: number,
    bounciness: number,
    callback?: ?Function
  ) {
    Animated.spring(this.state.scale, {
      toValue: value,
      velocity,
      bounciness,
    }).start(callback);
  }

  /**
   * `Touchable.Mixin` self callbacks. The mixin will invoke these if they are
   * defined on your component.
   */
  touchableHandleActivePressIn(e: Event) {
    this.bounceTo(0.93, 0.1, 0);
    this.props.onPressIn && this.props.onPressIn(e);
  }

  touchableHandleActivePressOut(e: Event) {
    this.bounceTo(1, 0.4, 0);
    this.props.onPressOut && this.props.onPressOut(e);
  }

  touchableHandlePress(e: Event) {
    var onPressWithCompletion = this.props.onPressWithCompletion;
    if (onPressWithCompletion) {
      onPressWithCompletion(() => {
        this.state.scale.setValue(0.93);
        this.bounceTo(1, 10, 10, this.props.onPressAnimationComplete);
      });
      return;
    }

    this.bounceTo(1, 10, 10, this.props.onPressAnimationComplete);
    this.props.onPress && this.props.onPress(e);
  }

  touchableGetPressRectOffset(): typeof PRESS_RECT_OFFSET {
    return PRESS_RECT_OFFSET;   // Always make sure to predeclare a constant!
  }

  touchableGetHighlightDelayMS(): number {
    return 0;
  }

  render(): ReactElement {
    return (
      <Animated.View
        style={[{transform: [{scale: this.state.scale}]}, this.props.style]}
        accessible={true}
        testID={this.props.testID}
        onStartShouldSetResponder={this.touchableHandleStartShouldSetResponder}
        onResponderTerminationRequest={this.touchableHandleResponderTerminationRequest}
        onResponderGrant={this.touchableHandleResponderGrant}
        onResponderMove={this.touchableHandleResponderMove}
        onResponderRelease={this.touchableHandleResponderRelease}
        onResponderTerminate={this.touchableHandleResponderTerminate}>
        {this.props.children}
      </Animated.View>
    );
  }

};

mixin(TouchableBounce.prototype, TouchableMixin);
autobind(TouchableBounce);

module.exports = TouchableBounce;

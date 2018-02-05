'use strict';
import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {
  StyleSheet,
  TextInput,
  LayoutAnimation,
  Animated,
  Easing,
  Text,
  View,
  Platform,
  TouchableOpacity,
  Image
} from 'react-native';

class FloatingLabelInput extends Component {

  constructor(props) {
    super(props);
    this._animate = this._animate.bind(this);
    this._onBlur = this._onBlur.bind(this);
    this._onFocus = this._onFocus.bind(this);
    this.onChangeText = this.onChangeText.bind(this);
    this.updateText = this.updateText.bind(this);

    const isDirty = (this.props.value || this.props.placeholder);
    const style = isDirty ? dirtyStyle : cleanStyle;
    this.isPasswordField = this.props.secureTextEntry;

    this.state = {
      text: this.props.value,
      dirty: isDirty,
      labelStyle: {
        fontSize: new Animated.Value(style.fontSize),
        top: new Animated.Value(style.top)
      },
      hidePassword: true,
      hideCaret: false
    };
  }

  _animate(dirty) {
    const nextStyle = dirty ? dirtyStyle : cleanStyle
    const labelStyle = this.state.labelStyle
    const anims = Object.keys(nextStyle).map(prop => {
      return Animated.timing(
        labelStyle[prop],
        {
          toValue: nextStyle[prop],
          duration: 200
        },
        Easing.ease
      )
    })

    Animated.parallel(anims).start();
  }

  componentWillReceiveProps (props) {
    if (typeof props.value !== 'undefined' && props.value !== this.state.text) {
      this.setState({ text: props.value, dirty: !!props.value });
      this._animate(!!props.value);
    }
  }

  _onFocus () {
    this._animate(true);
    this.setState({dirty: true});
    if (this.props.onFocus) {
      this.props.onFocus(arguments);
    }
  }

  _onBlur () {
    if (!this.state.text) {
      this._animate(false);
      this.setState({dirty: false});
    }

    if (this.props.onBlur) {
      this.props.onBlur(arguments);
    }
  }

  onChangeText(text) {
    this.setState({ text });
    if (this.props.onChangeText) {
      this.props.onChangeText(text);
    }
  }

  updateText(event) {
    const text = event.nativeEvent.text
    this.setState({ text });

    if (this.props.onEndEditing) {
      this.props.onEndEditing(event);
    }
  }

  managePasswordVisibility = () => {
    this.setState({ hidePassword: !this.state.hidePassword });
  }

  hidePassword = () => {
    this.setState({ hidePassword: true });
  }

  _renderLabel () {
    return (
      <Animated.Text
        ref='label'
        numberOfLines={this.props.numberOfLines}
        style={[this.state.labelStyle, styles.label, this.props.labelStyle]}>
        {this.props.children}
      </Animated.Text>
    );
  }

  _renderShowPasswordButton () {
    if (this.isPasswordField) {
        let source = (this.state.hidePassword) ? this.props.enableImg : this.props.disableImg;
        return (
            <TouchableOpacity activeOpacity={ 0.8 }
                style={ styles.visibilityBtn }
                onPress={ this.managePasswordVisibility }>
                <Image source={source}
                    style={ styles.btnImage } />
            </TouchableOpacity>
        );
    }
    return <View/>;
  }

  render() {
    let inputRef = this.props.inputRef;
    let props = {
        autoCapitalize: this.props.autoCapitalize,
        autoCorrect: this.props.autoCorrect,
        autoFocus: this.props.autoFocus,
        bufferDelay: this.props.bufferDelay,
        clearButtonMode: this.props.clearButtonMode,
        clearTextOnFocus: this.props.clearTextOnFocus,
        controlled: this.props.controlled,
        editable: this.props.editable,
        enablesReturnKeyAutomatically: this.props.enablesReturnKeyAutomatically,
        keyboardType: this.props.keyboardType,
        multiline: this.props.multiline,
        numberOfLines: this.props.numberOfLines,
        onBlur: this._onBlur,
        onChange: this.props.onChange,
        onChangeText: this.onChangeText,
        onEndEditing: this.updateText,
        onFocus: this._onFocus,
        onSubmitEditing: this.props.onSubmitEditing,
        password: this.props.secureTextEntry || this.props.password, // Compatibility
        placeholder: this.props.placeholder,
        returnKeyType: this.props.returnKeyType,
        selectTextOnFocus: this.props.selectTextOnFocus,
        selectionState: this.props.selectionState,
        spellCheck: this.props.spellCheck,
        style: [styles.input],
        testID: this.props.testID,
        value: this.state.text,
        underlineColorAndroid: this.props.underlineColorAndroid, // android TextInput will show the default bottom border
        onKeyPress: this.props.onKeyPress
      },
      elementStyles = [styles.element];

    if (this.props.inputStyle) {
      props.style.push(this.props.inputStyle);
    }

    if (this.props.style) {
      elementStyles.push(this.props.style);
    }

    return (
      <View style={elementStyles}>
        {this._renderLabel()}
        <View style={{flex: 1, flexDirection: 'row' }}>
            <TextInput
                ref={(r) => {
                    inputRef && inputRef(r);
                    this.passcode = r;
                }}
                secureTextEntry={ this.isPasswordField && this.state.hidePassword }
                caretHidden={ this.state.hideCaret }
                {...props} />
            {this._renderShowPasswordButton()}
        </View>
      </View>
    );
  }
}

const textPropTypes = Text.propTypes || View.propTypes;
const textInputPropTypes = TextInput.propTypes || textPropTypes;
FloatingLabelInput.propTypes = {
  ...textInputPropTypes,
  inputStyle: textInputPropTypes.style,
  labelStyle: textPropTypes.style,
  disabled: PropTypes.bool,
  style: View.propTypes.style,
};

let labelStyleObj = {
  marginTop: 21,
  paddingLeft: 0,
  color: '#AAA',
  position: 'absolute'
}

if (Platform.OS === 'web') {
  labelStyleObj.pointerEvents = 'none'
}

const styles = StyleSheet.create({
  element: {
    position: 'relative'
  },
  input: {
    flexGrow: 1,
    height: 40,
    borderColor: 'gray',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    borderWidth: 1,
    color: 'black',
    fontSize: 20,
    borderRadius: 4,
    paddingLeft: 0,
    marginTop: 20
  },
  label: labelStyleObj,
  visibilityBtn: {
    marginTop: 20,
    height: 40,
    width: 35,
    padding: 5
  },
  btnImage: {
    resizeMode: 'contain',
    height: '100%',
    width: '100%'
  }
})

const cleanStyle = {
  fontSize: 20,
  top: 7
}

const dirtyStyle = {
  fontSize: 12,
  top: -17,
}

export default FloatingLabelInput;
module.exports = FloatingLabelInput;

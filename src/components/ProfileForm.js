import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as t from 'tcomb-form-native';

// Components
import i18n from '../utils/i18n';

const styles = EStyleSheet.create({
  contentContainer: {
    padding: 12,
  },
  btn: {
    backgroundColor: '#4fbe31',
    padding: 12,
    borderRadius: 3,
  },
  btnText: {
    color: '#fff',
    fontSize: '1rem',
    textAlign: 'center',
  },
  header: {
    fontSize: '1.1rem',
    marginTop: 6,
    marginBottom: 12,
  },
});

const { Form } = t.form;

export default class ProfileForm extends Component {
  static propTypes = {
    fields: PropTypes.shape().isRequired,
    onSubmit: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.formsRef = {};
    this.state = {
      forms: [],
    };
  }

  componentDidMount() {
    const { fields } = this.props;
    const forms = [];

    Object.keys(fields)
      .forEach((key) => {
        forms.push({
          type: key,
          description: fields[key].description,
          ...this.convertFieldsToTcomb(fields[key]),
        });
      });
    this.setState({
      forms,
    });
  }

  getFieldType = (field) => {
    if (field.field_type === 'D') {
      // Date field
      return {
        type: field.required ? t.Date : t.maybe(t.Date),
        options: {
          label: field.description,
          defaultValueText: 'select date',
        },
      };
    }

    if (field.field_type === 'C') {
      // Checkbox field
      return {
        type: field.required ? t.Boolean : t.maybe(t.Boolean),
        options: {
          label: field.description,
        },
      };
    }

    if (field.field_type === 'S' || field.field_type === 'R') {
      // Selectbox
      const values = Array.isArray(field.values) ? {} : field.values;
      const Enums = t.enums(values);
      return {
        type: field.required ? Enums : t.maybe(Enums),
        options: {
          label: field.description,
        },
      };
    }

    if (field.field_type === 'W') {
      // Password field
      return {
        type: field.required ? t.String : t.maybe(t.String),
        options: {
          label: field.description,
          secureTextEntry: true,
          clearButtonMode: 'while-editing',
        },
      };
    }

    if (field.field_type === 'I') {
      // Text field
      return {
        type: field.required ? t.String : t.maybe(t.String),
        options: {
          label: field.description,
          clearButtonMode: 'while-editing',
        },
      };
    }

    return {
      type: field.required ? t.String : t.maybe(t.String),
      options: {
        label: field.description,
        clearButtonMode: 'while-editing',
      },
    };
  };

  convertFieldsToTcomb = (fields) => {
    const formFields = {};
    const formOptions = {
      disableOrder: true,
      fields: {},
    };

    Object.keys(fields.fields)
      .forEach((key) => {
        const item = fields.fields[key];
        const itedData = this.getFieldType(item);
        formFields[key] = itedData.type;
        formOptions.fields[key] = itedData.options;
      });

    return {
      formFields: t.struct(formFields),
      formOptions,
    };
  }

  handleValidate = () => {
    const { onSubmit } = this.props;
    let formsValues = {};
    let isFormsValid = true;

    Object.keys(this.formsRef)
      .forEach((key) => {
        const form = this.formsRef[key];
        const values = form.getValue();
        if (!values) {
          isFormsValid = false;
          return;
        }
        formsValues = {
          ...formsValues,
          ...values,
        };
      });

    if (isFormsValid) {
      onSubmit(formsValues);
    }
  }

  render() {
    const { forms } = this.state;

    return (
      <KeyboardAwareScrollView contentContainerStyle={styles.contentContainer}>
        {forms.map(form => (
          <View key={form.type}>
            {form.description !== '' && (
              <Text style={styles.header}>
                {form.description}
              </Text>
            )}
            <Form
              ref={(ref) => { this.formsRef[form.type] = ref; }}
              type={form.formFields}
              options={form.formOptions}
              value={{}}
            />
          </View>
        ))}
        <TouchableOpacity
          style={styles.btn}
          onPress={this.handleValidate}
        >
          <Text style={styles.btnText}>
            {i18n.gettext('Register')}
          </Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    );
  }
}

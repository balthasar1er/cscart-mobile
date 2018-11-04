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
import format from 'date-fns/format';

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
    fontSize: '1.2rem',
    marginTop: 10,
    marginBottom: 10,
  },
});

const { Form } = t.form;

export default class ProfileForm extends Component {
  static propTypes = {
    fields: PropTypes.shape().isRequired,
    onSubmit: PropTypes.func.isRequired,
    isEdit: PropTypes.bool,
  };

  static defaultProps = {
    isEdit: false,
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
      .sort()
      .forEach((key) => {
        forms.push({
          type: key,
          description: fields[key].description,
          ...this.convertFieldsToTcomb(fields[key].fields),
        });
      });
    this.setState({
      forms,
    });
  }

  getFieldType = (field, allFields) => {
    const label = field.description;
    const help = !field.required ? `${i18n.gettext('(Optional)')}` : '';

    if (field.field_type === 'D') {
      // Date field
      return {
        type: field.required ? t.Date : t.maybe(t.Date),
        options: {
          label,
          help,
          defaultValueText: i18n.gettext('Select date'),
          mode: 'date',
          config: {
            format: date => format(date, 'MM/DD/YYYY'),
          },
        },
      };
    }

    if (field.field_type === 'C') {
      // Checkbox field
      return {
        type: field.required ? t.Boolean : t.maybe(t.Boolean),
        options: {
          label,
          help,
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
          label,
          help,
        },
      };
    }

    if (field.field_type === 'W') {
      // Password field
      return {
        type: field.required ? t.String : t.maybe(t.String),
        options: {
          label,
          help,
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
          label,
          help,
          clearButtonMode: 'while-editing',
        },
      };
    }

    if (field.field_type === 'O') {
      // Country field
      return {
        type: field.required ? t.enums(field.values) : t.maybe(t.enums(field.values)),
        options: {
          label,
          help,
          defaultValueText: i18n.gettext('Select country'),
          nullOption: {
            value: '',
            text: i18n.gettext('Select country')
          },
        },
      };
    }

    if (field.field_type === 'A') {
      // State field
      let countryCode = null;
      let values = null;

      if ('s_country' in allFields) {
        countryCode = allFields.s_country.value;
      }

      if ('b_country' in allFields) {
        countryCode = allFields.b_country.value;
      }

      if (countryCode in field.values) {
        values = field.values[countryCode];
      }

      let type = field.required ? t.String : t.maybe(t.String);
      if (values) {
        type = field.required ? t.enums(values) : t.maybe(t.enums(values));
      }

      return {
        type,
        options: {
          label,
          help,
          defaultValueText: i18n.gettext('Select state'),
          nullOption: {
            value: '',
            text: i18n.gettext('Select state')
          },
        },
      };
    }

    return {
      type: field.required ? t.String : t.maybe(t.String),
      options: {
        label,
        help,
        clearButtonMode: 'while-editing',
      },
    };
  };

  convertFieldsToTcomb = (fields) => {
    const formValues = {};
    const formFields = {};
    const formOptions = {
      fields: {},
    };

    Object.keys(fields)
      .forEach((key) => {
        const item = fields[key];
        const itemData = this.getFieldType(item, fields);
        formFields[key] = itemData.type;
        formOptions.fields[key] = itemData.options;
        formValues[key] = item.value;
      });

    return {
      fields,
      formFields: t.struct(formFields),
      formOptions,
      formValues,
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

  handleChange(values, index) {
    const { forms } = this.state;
    const newForms = [...forms];
    const fields = {};
    const newFormValues = { ...values };

    Object.keys(newForms[index].formValues)
      .forEach((key) => {
        if (key === 's_country') {
          const item = newForms[index].formValues[key];
          if (item !== values.s_country) {
            newFormValues.s_state = '';
          }
        }
        if (key === 'b_country') {
          const item = newForms[index].formValues[key];
          if (item !== values.b_country) {
            newFormValues.b_state = '';
          }
        }
      });
    newForms[index].formValues = newFormValues;

    Object.keys(newForms[index].fields)
      .forEach((key) => {
        const item = newForms[index].fields[key];
        fields[key] = item;
        fields[key].value = values[key];
      });

    newForms[index].formFields = this.convertFieldsToTcomb(fields).formFields;
    this.setState({
      forms: newForms,
    });
  }

  render() {
    const { forms } = this.state;
    const { isEdit } = this.props;

    return (
      <KeyboardAwareScrollView contentContainerStyle={styles.contentContainer}>
        {forms.map((form, index) => (
          <View key={form.type}>
            {(isEdit && form.description !== '') && (
              <View>
                <Text style={styles.header}>
                  {form.description}
                </Text>
              </View>
            )}
            <Form
              ref={(ref) => { this.formsRef[form.type] = ref; }}
              type={form.formFields}
              options={form.formOptions}
              value={form.formValues}
              onChange={values => this.handleChange(values, index)}
            />
          </View>
        ))}
        <TouchableOpacity
          style={styles.btn}
          onPress={this.handleValidate}
        >
          <Text style={styles.btnText}>
            {isEdit ? i18n.gettext('Save') : i18n.gettext('Register')}
          </Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    );
  }
}

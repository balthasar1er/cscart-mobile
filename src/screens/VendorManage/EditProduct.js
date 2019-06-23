import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as t from 'tcomb-form-native';
import ActionSheet from 'react-native-actionsheet';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

// Styles
import theme from '../../config/theme';

// Components
import Section from '../../components/Section';
import Spinner from '../../components/Spinner';
import Icon from '../../components/Icon';
import BottomActions from '../../components/BottomActions';

import * as notificationsActions from '../../actions/notificationsActions';

// Graphql
import { getProductDetail, updateProduct, deleteProduct } from '../../services/vendors';

import i18n from '../../utils/i18n';
import { registerDrawerDeepLinks } from '../../utils/deepLinks';
import { getProductStatus } from '../../utils';

import {
  iconsMap,
  iconsLoaded,
} from '../../utils/navIcons';

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$grayColor',
  },
  scrollContainer: {
    paddingBottom: 14,
  },
  menuItem: {
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 10,
    paddingTop: 10,
    paddingBottom: 10,
  },
  menuItemTitle: {
    color: '#8f8f8f',
    fontSize: '0.8rem',
    paddingBottom: 4,
  },
  menuItemText: {
    width: '90%',
  },
  btnIcon: {
    color: '#898989',
  }
});

const Form = t.form.Form;
const formFields = t.struct({
  product: t.String,
  full_description: t.maybe(t.String),
  price: t.Number,
});
const formOptions = {
  disableOrder: true,
  fields: {
    full_description: {
      label: i18n.gettext('Full description'),
    }
  },
};

const MORE_ACTIONS_LIST = [
  i18n.gettext('Delete This Product'),
  i18n.gettext('Cancel'),
];

const STATUS_ACTIONS_LIST = [
  i18n.gettext('Make Product Disabled'),
  i18n.gettext('Make Product Hidden'),
  i18n.gettext('Make Product Active'),
  i18n.gettext('Cancel'),
];

class EditProduct extends Component {
  static propTypes = {
    showBack: PropTypes.bool,
    productID: PropTypes.number,
    notificationsActions: PropTypes.shape({
      hide: PropTypes.func,
    }),
    stepsData: PropTypes.shape({}),
    navigator: PropTypes.shape({
      setTitle: PropTypes.func,
      setButtons: PropTypes.func,
      push: PropTypes.func,
      setOnNavigatorEvent: PropTypes.func,
    }),
  };

  constructor(props) {
    super(props);

    this.formRef = React.createRef();
    this.state = {
      loading: true,
      product: {},
    };

    props.navigator.setTitle({
      title: i18n.gettext('Edit').toUpperCase(),
    });

    props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  componentWillMount() {
    const { navigator, showBack } = this.props;
    iconsLoaded.then(() => {
      navigator.setButtons({
        leftButtons: [
          showBack ? {} : {
            title: i18n.gettext('Cancel'),
            id: 'next',
            showAsAction: 'ifRoom',
            buttonColor: theme.$primaryColor,
            buttonFontSize: 16,
          },
        ],
        rightButtons: [
          {
            id: 'more',
            icon: iconsMap['more-horiz'],
          },
        ],
      });
    });
  }

  componentDidMount() {
    this.handleFetchDetail();
  }

  onNavigatorEvent(event) {
    const { navigator } = this.props;
    registerDrawerDeepLinks(event, navigator);
    if (event.type === 'NavBarButtonPress') {
      if (event.id === 'more') {
        this.ActionSheet.show();
      }
    }
  }

  handleFetchDetail = async () => {
    const { productID, navigator } = this.props;
    try {
      const { data } = await getProductDetail(productID);
      navigator.setTitle({
        title: i18n.gettext(data.product.product).toUpperCase(),
      });
      this.setState({
        product: data.product,
        loading: false,
      });
    } catch (error) {
      // pass
    }
  }

  handleMoreActionSheet = async (index) => {
    const { navigator } = this.props;
    const { product } = this.state;
    if (index === 0) {
      const result = await deleteProduct(product.product_id);
      if (result) {
        navigator.pop();
      }
    }
  }

  handleStatusActionSheet = async (index) => {
    const { notificationsActions } = this.props;
    const { product } = this.state;
    const statuses = [
      'D',
      'H',
      'A'
    ];
    const activeStatus = statuses[index];

    if (activeStatus) {
      await updateProduct(
        product.product_id,
        {
          status: statuses[index],
        }
      );

      notificationsActions.show({
        type: 'success',
        title: i18n.gettext('Success'),
        text: i18n.gettext('Product saved.'),
        closeLastModal: false,
      });

      this.setState({
        product: {
          ...product,
          status: statuses[index],
        }
      });
    }
  }

  handleSave = async () => {
    const { notificationsActions } = this.props;
    const { product } = this.state;
    const values = this.formRef.current.getValue();
    if (!values) { return; }
    try {
      const result = await updateProduct(
        product.product_id,
        { ...values }
      );

      if (result.errors) {
        notificationsActions.show({
          type: 'info',
          title: i18n.gettext('Error'),
          text: i18n.gettext('Save error.'),
          closeLastModal: false,
        });
      }

      notificationsActions.show({
        type: 'success',
        title: i18n.gettext('Success'),
        text: i18n.gettext('Product saved.'),
        closeLastModal: false,
      });

      this.setState({
        product: {
          ...product,
          ...values,
        },
      });
    } catch (error) {
      // pass
    }
  };

  renderMenuItem = (title, subTitle, fn = () => {}) => (
    <TouchableOpacity style={styles.menuItem} onPress={fn}>
      <View style={styles.menuItemText}>
        <Text style={styles.menuItemTitle}>{title}</Text>
        <Text
          style={styles.menuItemSubTitle}
        >
          {subTitle}
        </Text>
      </View>
      <Icon name="keyboard-arrow-right" style={styles.btnIcon} />
    </TouchableOpacity>
  );

  render() {
    const { navigator } = this.props;
    const { loading, product } = this.state;

    if (loading) {
      return (
        <Spinner visible mode="content" />
      );
    }

    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Section>
            <Form
              ref={this.formRef}
              type={formFields}
              value={product}
              options={formOptions}
            />
          </Section>
          <Section wrapperStyle={{ padding: 0 }}>
            {this.renderMenuItem(
              i18n.gettext('Status'),
              getProductStatus(product.status).text,
              () => {
                this.StatusActionSheet.show();
              }
            )}
            {this.renderMenuItem(
              i18n.gettext('Pricing / Inventory'),
              i18n.gettext('%1, List price: %2, In stock: %3', product.product, product.list_price, product.amount),
              () => {
                navigator.push({
                  screen: 'VendorManagePricingInventory',
                  backButtonTitle: '',
                  passProps: {
                    values: {
                      ...product,
                    }
                  },
                });
              }
            )}
            {this.renderMenuItem(
              i18n.gettext('Categories'),
              product.categories.map(item => item.category).join(', '),
              () => {
                navigator.push({
                  screen: 'VendorManageCategoriesPicker',
                  backButtonTitle: '',
                  passProps: {
                    selected: product.categories,
                  },
                });
              }
            )}
            {this.renderMenuItem(
              i18n.gettext('Shipping properties'),
              `${i18n.gettext('Weight: %1', product.weight)}${product.free_shipping ? i18n.gettext('Free shipping') : ''}`,
              () => {
                navigator.push({
                  screen: 'VendorManageShippingProperties',
                  backButtonTitle: '',
                  passProps: {
                    values: {
                      ...product
                    }
                  },
                });
              }
            )}
          </Section>
        </ScrollView>
        <BottomActions onBtnPress={this.handleSave} />
        <ActionSheet
          ref={(ref) => { this.ActionSheet = ref; }}
          options={MORE_ACTIONS_LIST}
          cancelButtonIndex={1}
          destructiveButtonIndex={0}
          onPress={this.handleMoreActionSheet}
        />
        <ActionSheet
          ref={(ref) => { this.StatusActionSheet = ref; }}
          options={STATUS_ACTIONS_LIST}
          cancelButtonIndex={3}
          destructiveButtonIndex={0}
          onPress={this.handleStatusActionSheet}
        />
      </View>
    );
  }
}

export default connect(
  state => ({
    notifications: state.notifications,
  }),
  dispatch => ({
    notificationsActions: bindActionCreators(notificationsActions, dispatch),
  })
)(EditProduct);

import React, { Component } from 'react';
import PropTypes from 'prop-types';
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
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

// Styles
import theme from '../../config/theme';

// Components
import Section from '../../components/Section';
import Spinner from '../../components/Spinner';
import Icon from '../../components/Icon';

// Graphql
import GraphQL from '../../services/GraphQL';

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
  full_description: t.String,
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

const GET_PRODUCTS = gql`
query {
  product(id: 247, get_icon: true, get_detailed: true, get_additional: true) {
    product_id
    product
    price
    full_description
    list_price
    status
    product_code
    amount
    weight
    free_shipping
    product_features {
      feature_id
      value
      variant_id
      variant
      feature_type
      description
    }
    categories {
      category_id
      category
    }
    
    image_pairs {
      icon {
        image_path
      }
    },
    main_pair {
      icon {
        image_path
      }
    }
  }
}
`;

class EditProduct extends Component {
  static propTypes = {
    showBack: PropTypes.bool,
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

  onNavigatorEvent(event) {
    const { navigator } = this.props;
    registerDrawerDeepLinks(event, navigator);
    if (event.type === 'NavBarButtonPress') {
      if (event.id === 'more') {
        this.ActionSheet.show();
      }
    }
  }

  handleMoreActionSheet = (index) => {
    const { navigator } = this.props;
    if (index === 0) {
      navigator.pop();
      console.log(index, 'delete');
    }
  }

  handleStatusActionSheet = (index) => {
    const { navigator } = this.props;
    if (index === 0) {
      navigator.pop();
      console.log(index, 'delete');
    }
  }

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
    return (
      <GraphQL>
        <Query query={GET_PRODUCTS}>
          {({ loading, error, data }) => {
            if (loading) {
              return (
                <Spinner visible mode="content" />
              );
            }

            if (error) {
              return `Error! ${error.message}`;
            }

            navigator.setTitle({
              title: i18n.gettext(data.product.product).toUpperCase(),
            });

            const {
              status,
              product,
              list_price,
              product_code,
              amount,
              categories,
              weight,
              free_shipping,
            } = data.product;

            return (
              <View style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                  <Section>
                    <Form
                      ref="form"
                      type={formFields}
                      value={data.product}
                      options={formOptions}
                    />
                  </Section>

                  <Section wrapperStyle={{ padding: 0 }}>
                    {this.renderMenuItem(
                      i18n.gettext('Status'),
                      getProductStatus(status).text,
                      () => {
                        this.StatusActionSheet.show();
                      }
                    )}
                    {this.renderMenuItem(
                      i18n.gettext('Pricing / Inventory'),
                      i18n.gettext('%1, List price: %2, In stock: %3', product, list_price, amount),
                      () => {
                        navigator.push({
                          screen: 'VendorManagePricingInventory',
                          backButtonTitle: '',
                          passProps: {
                            values: {
                              list_price,
                              product_code,
                              amount,
                            }
                          },
                        });
                      }
                    )}
                    {this.renderMenuItem(
                      i18n.gettext('Categories'),
                      categories.map(item => item.category).join(', '),
                    )}
                    {this.renderMenuItem(
                      i18n.gettext('Shipping properties'),
                      `${i18n.gettext('Weight: %1', weight)}${free_shipping ? i18n.gettext('Free shipping') : ''}`,
                      () => {
                        navigator.push({
                          screen: 'VendorManageShippingProperties',
                          backButtonTitle: '',
                          passProps: {
                            values: {
                              weight,
                              free_shipping,
                            }
                          },
                        });
                      }
                    )}
                  </Section>
                </ScrollView>
              </View>
            );
          }}
        </Query>
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
      </GraphQL>
    );
  }
}

export default connect(
  state => ({
    nav: state.nav,
  }),
)(EditProduct);

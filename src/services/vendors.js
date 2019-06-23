import axios from 'axios';
import base64 from 'base-64';

import config from '../config';
import store from '../store';
import i18n from '../utils/i18n';

// Config axios defaults.
const AxiosInstance = axios.create({
  baseURL: `${config.baseUrl}/graphql`,
  timeout: 100000,
});

AxiosInstance.interceptors.request.use((conf) => {
  const state = store.getState();
  const newConf = { ...conf };

  newConf.headers.common['Storefront-Api-Access-Key'] = config.apiKey;
  newConf.headers.common['Cache-Control'] = 'no-cache';

  if (state.auth.token) {
    newConf.headers.common.Authorization = `Basic ${base64.encode(state.auth.token)}:`;
  }
  return newConf;
});

const gql = (query, variables) => AxiosInstance.post('', { query, variables });

export const steps = [
  i18n.gettext('Image'),
  i18n.gettext('Enter the name'),
  i18n.gettext('Enter the price'),
];

export const getProductDetail = (id) => {
  const QUERY = `query getProducts($id: Int!) {
      product(id: $id, get_icon: true, get_detailed: true, get_additional: true) {
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
  return gql(QUERY, { id }).then(result => result.data);
};

export const updateProduct = (id, product) => {
  const QUERY = `
    mutation updateProduct($id: Int!, $product: UpdateProductInput!) {
      update_product(id: $id, product: $product)
    }
  `;
  return gql(QUERY, { id, product }).then(result => result.data);
};

export const deleteProduct = (id) => {
  const QUERY = `
    mutation deleteProduct($id: Int!) {
      delete_product(id: $id)
    }
  `;
  return gql(QUERY, { id }).then(result => result.data);
};


export const createProduct = (product) => {
  const QUERY = `
    mutation createProduct($product: CreateProductInput!) {
      create_product(product: $product)
    }
  `;
  return gql(QUERY, { product }).then(result => result.data);
};


export const getProductsList = (page = 1) => {
  const QUERY = `query getProducts($page: Int) {
    products(page: $page, items_per_page: 50) {
      product
      price
      amount
      product_code
      product_id
      main_pair {
        icon {
          image_path
        }
      }
    }
  }`;

  return gql(QUERY, { page }).then(result => result.data);
};

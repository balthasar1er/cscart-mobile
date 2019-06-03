import base64 from 'base-64';
import React from 'react';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { ApolloLink, concat } from 'apollo-link';
import { ApolloProvider } from 'react-apollo';
import { InMemoryCache } from 'apollo-cache-inmemory';

import config from '../config';
import store from '../store';

const httpLink = new HttpLink({ uri: `${config.baseUrl}/graphql` });

const authMiddleware = new ApolloLink((operation, forward) => {
  const state = store.getState();
  const headers = {
    'Storefront-Api-Access-Key': config.apiKey,
    'Cache-Control': 'no-cache',
  };

  if (state.auth.token) {
    headers.Authorization = `Basic ${base64.encode(state.auth.token)}:`;
  }

  operation.setContext({
    headers
  });

  return forward(operation);
});

const client = new ApolloClient({
  link: concat(authMiddleware, httpLink),
  cache: new InMemoryCache(),
});

const Provider = ({ children }) => (
  <ApolloProvider client={client}>
    {children}
  </ApolloProvider>
);

export default Provider;

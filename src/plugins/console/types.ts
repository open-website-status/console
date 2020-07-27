export type Provider = {
  id: string;
  name: string;
  token: string;
  creationTimestamp: string;
}

export type ProviderListMessage = {
  data: Provider[];
}

export type APIClient = {
  id: string;
  name: string;
  token: string;
  creationTimestamp: string;
}

export type APIClientListMessage = {
  data: APIClient[];
}

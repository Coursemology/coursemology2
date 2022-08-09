export interface ComponentListData {
  name: string;
  key: string;
}

export interface ComponentMiniEntity {
  id: number;
  name: string;
  key: string;
  enabled: boolean;
}

export interface InstanceComponents {
  components: InstanceComponent[];
}

export interface InstanceComponent {
  id?: number;
  name: string;
  key: string;
  enabled: boolean;
  lastUpdate?: number;
  lastFullUpdate?: number;
}

export interface ComponentsPostData {
  components: InstanceComponent[];
}

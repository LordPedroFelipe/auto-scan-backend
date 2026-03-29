export interface ExternalOptional {
  codigo: string;
  descricao: string;
}

export interface ExternalVehicleRecord {
  cod_veiculo: string;
  cod_importacao?: string;
  categoria?: string;
  marca: string;
  modelo: string;
  tipo_categoria?: string;
  motor?: string;
  versao?: string;
  veiculo?: string;
  veiculo2?: string;
  combustivel?: string;
  cor?: string;
  ano: string;
  valor: string;
  valor_oferta?: string;
  data_cad?: string;
  km?: string;
  obs?: string;
  obs_site?: string;
  situacao?: string;
  placa?: string;
  destaqueSite?: string;
  cidade?: string;
  uf?: string;
  cambio?: string;
  estado?: string;
  em_oferta?: string;
  opcionais?: ExternalOptional[];
  fotos?: string[];
}

export interface ExternalInventoryFeed {
  cod_loja: string;
  total: number;
  veiculos: ExternalVehicleRecord[];
}

export interface InventorySyncResult {
  shopId: string;
  shopName: string;
  imported: number;
  created: number;
  updated: number;
  deactivated: number;
  totalInFeed: number;
  syncedAt: string;
}

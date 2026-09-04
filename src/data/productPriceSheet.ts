import { Product } from '../types';

export interface SheetRowItem {
  code: string;
  description: string;
  supplier: string;
  cost: number;
  wholesalePrice: number;
  suggestedPublicPrice: number;
  category: string;
}

export const PARSED_SHEET_DATA: SheetRowItem[] = [
  { code: 'P001', description: 'SAN IGINIO ALCOHOL EN GEL X 250', supplier: 'Pablo Preventa', cost: 1649, wholesalePrice: 1870, suggestedPublicPrice: 2431, category: 'Perfumería' },
  { code: 'P002', description: 'SAN IGINIO ALCOHOL X 500 ML', supplier: 'Pablo Preventa', cost: 1415, wholesalePrice: 1750, suggestedPublicPrice: 2275, category: 'Perfumería' },
  { code: 'P003', description: 'SAN IGINIO ALCOHOL X 1000 ML (1L)', supplier: 'Pablo Preventa', cost: 2789, wholesalePrice: 3260, suggestedPublicPrice: 4238, category: 'Perfumería' },
  { code: 'P004', description: 'DONCELLA PROTECTOR DIARIO X 20', supplier: 'Pablo Preventa', cost: 789, wholesalePrice: 990, suggestedPublicPrice: 1287, category: 'Perfumería' },
  { code: 'P005', description: 'DONCELLA TOALLA X 8 NORMAL', supplier: 'Pablo Preventa', cost: 660, wholesalePrice: 780, suggestedPublicPrice: 1014, category: 'Perfumería' },
  { code: 'P006', description: 'DONCELLA TOALLA X 8 VERDE', supplier: 'Pablo Preventa', cost: 669, wholesalePrice: 796, suggestedPublicPrice: 1035, category: 'Perfumería' },
  { code: 'P007', description: 'BIC CONFORT 3 VERDE (3 FILOS)', supplier: 'Pablo Preventa', cost: 949, wholesalePrice: 1280, suggestedPublicPrice: 1664, category: 'Perfumería' },
  { code: 'P008', description: 'BIC CONFORT 2', supplier: 'Pablo Preventa', cost: 949, wholesalePrice: 1130, suggestedPublicPrice: 1469, category: 'Perfumería' },
  { code: 'P009', description: 'BIC SOLEI 3 FILOS ROSA', supplier: 'Pablo Preventa', cost: 1389, wholesalePrice: 1625, suggestedPublicPrice: 2112, category: 'Perfumería' },
  { code: 'P010', description: 'BIC TWIN CONFORT SENSITIVE', supplier: 'Maxi Mayorista', cost: 750, wholesalePrice: 890, suggestedPublicPrice: 1157, category: 'Perfumería' },
  { code: 'P011', description: 'BIC SOLEIL 3 FILOS (BLISTER)', supplier: 'Pablo Preventa', cost: 1389, wholesalePrice: 1625, suggestedPublicPrice: 2112, category: 'Perfumería' },
  { code: 'P012', description: 'JOHNSON ACEITE X 100 ML', supplier: 'Pablo Preventa', cost: 4730, wholesalePrice: 5540, suggestedPublicPrice: 7202, category: 'Perfumería' },
  { code: 'P014', description: 'JOHNSON AC. ORIGINAL X 200 ML', supplier: 'Pablo Preventa', cost: 4549, wholesalePrice: 5460, suggestedPublicPrice: 7098, category: 'Perfumería' },
  { code: 'P015', description: 'JOHNSON COTONETES FLEXI X 75', supplier: 'Pablo Preventa', cost: 1489, wholesalePrice: 1740, suggestedPublicPrice: 2262, category: 'Perfumería' },
  { code: 'P016', description: 'JOHNSON COTONETES POTE X 150', supplier: 'Pablo Preventa', cost: 3195, wholesalePrice: 3739, suggestedPublicPrice: 4860, category: 'Perfumería' },
  { code: 'P017', description: 'JOHNSON ACEITE PURO X 100 ML', supplier: 'Pablo Preventa', cost: 4439, wholesalePrice: 5540, suggestedPublicPrice: 7202, category: 'Perfumería' },
  { code: 'P018', description: 'DEA LANA DE ACERO 70 G X 10', supplier: 'Pablo Preventa', cost: 799, wholesalePrice: 940, suggestedPublicPrice: 1222, category: 'Limpieza' },
  { code: 'P019', description: 'DEA PALO DE MADERA FORRADO 1.20M', supplier: 'Pablo Preventa', cost: 940, wholesalePrice: 1200, suggestedPublicPrice: 1560, category: 'Limpieza' },
  { code: 'P020', description: 'DEA ESCOBILLON NEPTUNO', supplier: 'Pablo Preventa', cost: 2825, wholesalePrice: 3300, suggestedPublicPrice: 4290, category: 'Limpieza' },
  { code: 'P021', description: 'DEA ESCOBILLON MERCURIO', supplier: 'Pablo Preventa', cost: 3149, wholesalePrice: 3680, suggestedPublicPrice: 4784, category: 'Limpieza' },
  { code: 'P022', description: 'DEA CEPILLO DE MANO PLANCHITA', supplier: 'Pablo Preventa', cost: 1626, wholesalePrice: 1900, suggestedPublicPrice: 2470, category: 'Limpieza' },
  { code: 'P023', description: 'DEA ESCOBA JUPITER', supplier: 'Pablo Preventa', cost: 2385, wholesalePrice: 2910, suggestedPublicPrice: 3783, category: 'Limpieza' },
  { code: 'P024', description: 'DEA ESPONJA ATIBAC / CERO RAYAS', supplier: 'Pablo Preventa', cost: 520, wholesalePrice: 660, suggestedPublicPrice: 858, category: 'Limpieza' },
  { code: 'P025', description: 'DEA ESPONJA ULTRA DARK NEGRA', supplier: 'Pablo Preventa', cost: 599, wholesalePrice: 740, suggestedPublicPrice: 962, category: 'Limpieza' },
  { code: 'P026', description: 'DEA ESPONJA EXTRA FUERTE FIBRA', supplier: 'Pablo Preventa', cost: 599, wholesalePrice: 750, suggestedPublicPrice: 975, category: 'Limpieza' },
  { code: 'P027', description: 'DEA ESPONJA ACERO X 2', supplier: 'Pablo Preventa', cost: 530, wholesalePrice: 700, suggestedPublicPrice: 910, category: 'Limpieza' },
  { code: 'P028', description: 'DEA ESPONJA ACERO XL', supplier: 'Pablo Preventa', cost: 799, wholesalePrice: 950, suggestedPublicPrice: 1235, category: 'Limpieza' },
  { code: 'P029', description: 'DEA ESPONJA BRONCE X 2', supplier: 'Pablo Preventa', cost: 1109, wholesalePrice: 1320, suggestedPublicPrice: 1716, category: 'Limpieza' },
  { code: 'P030', description: 'DEA ESPONJA DE ACERO X 2 ECONOMICA', supplier: 'Pablo Preventa', cost: 499, wholesalePrice: 700, suggestedPublicPrice: 910, category: 'Limpieza' },
  { code: 'P031', description: 'DEA ESTROPAJO DE ACERO', supplier: 'Pablo Preventa', cost: 399, wholesalePrice: 600, suggestedPublicPrice: 780, category: 'Limpieza' },
  { code: 'P032', description: 'DEA PAÑO MULTIUSO X 3', supplier: 'Pablo Preventa', cost: 1199, wholesalePrice: 1450, suggestedPublicPrice: 1885, category: 'Limpieza' },
  { code: 'P033', description: 'DEA REJILLA EXTRA GRANDE', supplier: 'Pablo Preventa', cost: 1139, wholesalePrice: 1450, suggestedPublicPrice: 1885, category: 'Limpieza' },
  { code: 'P034', description: 'DEA REJILLA DOBLE', supplier: 'Pablo Preventa', cost: 1269, wholesalePrice: 1550, suggestedPublicPrice: 2015, category: 'Limpieza' },
  { code: 'P035', description: 'DEA TRAPO DE PISO BLANCO', supplier: 'Pablo Preventa', cost: 1160, wholesalePrice: 1450, suggestedPublicPrice: 1885, category: 'Limpieza' },
  { code: 'P036', description: 'DEA TRAPO DE PISO GRIS', supplier: 'Pablo Preventa', cost: 1120, wholesalePrice: 1400, suggestedPublicPrice: 1820, category: 'Limpieza' },
  { code: 'P037', description: 'ALA JABON POLVO X 800 REGULAR', supplier: 'Pablo Preventa', cost: 2319, wholesalePrice: 3000, suggestedPublicPrice: 3900, category: 'Limpieza' },
  { code: 'P038', description: 'ALA JABON LIQUIDO X 800 DP', supplier: 'Pablo Preventa', cost: 2319, wholesalePrice: 3000, suggestedPublicPrice: 3900, category: 'Limpieza' },
  { code: 'P039', description: 'SKIP JABON LIQUIDO X 800 DP', supplier: 'Pablo Preventa', cost: 2488, wholesalePrice: 3160, suggestedPublicPrice: 4108, category: 'Limpieza' },
  { code: 'P040', description: 'SEDAL SH. X 340 LISO PERFECTO', supplier: 'Pablo Preventa', cost: 3499, wholesalePrice: 4165, suggestedPublicPrice: 5414, category: 'Perfumería' },
  { code: 'P041', description: 'SEDAL AC. X 340 LISO PERFECTO', supplier: 'Pablo Preventa', cost: 3499, wholesalePrice: 4165, suggestedPublicPrice: 5414, category: 'Perfumería' },
  { code: 'P042', description: 'SEDAL AC. X 340 RESTAURACION', supplier: 'Pablo Preventa', cost: 3499, wholesalePrice: 4165, suggestedPublicPrice: 5414, category: 'Perfumería' },
  { code: 'P043', description: 'SEDAL AC. X 340 CERAMIDAS', supplier: 'Pablo Preventa', cost: 3499, wholesalePrice: 4165, suggestedPublicPrice: 5414, category: 'Perfumería' },
  { code: 'P044', description: 'SEDAL AC. X 340 RIZOS DEFINIDOS', supplier: 'Pablo Preventa', cost: 3499, wholesalePrice: 4165, suggestedPublicPrice: 5414, category: 'Perfumería' },
  { code: 'P045', description: 'SEDAL SH. X 340 RIZOS DEFINIDOS', supplier: 'Pablo Preventa', cost: 3499, wholesalePrice: 4165, suggestedPublicPrice: 5414, category: 'Perfumería' },
  { code: 'P046', description: 'SEDAL SH. X 340 BOMBA DE COCO', supplier: 'Pablo Preventa', cost: 3499, wholesalePrice: 4165, suggestedPublicPrice: 5414, category: 'Perfumería' },
  { code: 'P047', description: 'SEDAL SH. X 340 CERAMIDAS', supplier: 'Pablo Preventa', cost: 3499, wholesalePrice: 4165, suggestedPublicPrice: 5414, category: 'Perfumería' },
  { code: 'P048', description: 'SEDAL SH. X 340 CRECIMIENTO FUERTE', supplier: 'Pablo Preventa', cost: 3499, wholesalePrice: 4165, suggestedPublicPrice: 5414, category: 'Perfumería' },
  { code: 'P049', description: 'SEDAL SH. X 340 SOS RESTAURACION', supplier: 'Pablo Preventa', cost: 3499, wholesalePrice: 4165, suggestedPublicPrice: 5414, category: 'Perfumería' },
  { code: 'P050', description: 'CANDELA ESPONJA ROJA', supplier: 'Pablo Preventa', cost: 379, wholesalePrice: 450, suggestedPublicPrice: 585, category: 'Limpieza' },
  { code: 'P051', description: 'CANDELA ESPONJA VERDE', supplier: 'Pablo Preventa', cost: 379, wholesalePrice: 450, suggestedPublicPrice: 585, category: 'Limpieza' },
  { code: 'P052', description: 'CANDELA PAÑO MULTIUSO X 3', supplier: 'Pablo Preventa', cost: 759, wholesalePrice: 900, suggestedPublicPrice: 1170, category: 'Limpieza' },
  { code: 'P053', description: 'CANDELA REJILLA EMBOLSADA', supplier: 'Pablo Preventa', cost: 939, wholesalePrice: 1100, suggestedPublicPrice: 1430, category: 'Limpieza' },
  { code: 'P054', description: 'CANDELA TRAPO DE PISO BLANCO', supplier: 'Pablo Preventa', cost: 859, wholesalePrice: 1050, suggestedPublicPrice: 1365, category: 'Limpieza' },
  { code: 'P055', description: 'CANDELA TRAPO DE PISO GRIS', supplier: 'Pablo Preventa', cost: 749, wholesalePrice: 900, suggestedPublicPrice: 1170, category: 'Limpieza' },
  { code: 'P056', description: 'BORITA JABON P/DILUIR X 500 ML', supplier: 'Pablo Preventa', cost: 5259, wholesalePrice: 6260, suggestedPublicPrice: 8138, category: 'Limpieza' },
  { code: 'P057', description: 'BORITA SUAVIZANTE P/DILUIR X 500 ML', supplier: 'Pablo Preventa', cost: 4479, wholesalePrice: 5480, suggestedPublicPrice: 7124, category: 'Limpieza' },
  { code: 'P058', description: 'COLGATE TRIPLE ACCION X 180 G', supplier: 'Pablo Preventa', cost: 2458, wholesalePrice: 3000, suggestedPublicPrice: 3900, category: 'Perfumería' },
  { code: 'P059', description: 'COLGATE TRIPLE ACCION X 140 G', supplier: 'Pablo Preventa', cost: 2228, wholesalePrice: 2800, suggestedPublicPrice: 3640, category: 'Perfumería' },
  { code: 'P060', description: 'COLGATE TRIPLE ACCION X 90 G', supplier: 'Pablo Preventa', cost: 1488, wholesalePrice: 1950, suggestedPublicPrice: 2535, category: 'Perfumería' },
  { code: 'P061', description: 'COLGATE TRIPLE ACCION X 70 G', supplier: 'Pablo Preventa', cost: 1258, wholesalePrice: 1500, suggestedPublicPrice: 1950, category: 'Perfumería' },
  { code: 'P062', description: 'COLGATE TOTAL 12 CLEAN MINT X 90 G', supplier: 'Pablo Preventa', cost: 2449, wholesalePrice: 3000, suggestedPublicPrice: 3900, category: 'Perfumería' },
];

export function convertSheetItemsToProducts(items: SheetRowItem[]): Product[] {
  return items.map((item, idx) => ({
    id: `prod-sheet-${item.code.toLowerCase()}`,
    sku: item.code,
    name: item.description,
    brand: item.description.split(' ')[0] || 'DistriPro',
    presentation: 'unidades / packs según bulto',
    category: item.category,
    priceWholesale: item.wholesalePrice,
    costPrice: item.cost,
    suggestedRetailPrice: item.suggestedPublicPrice,
    unitType: 'unidades',
    unitsPerPack: 12,
    stockTruck: 15,
    stockCentral: 180,
    barcode: `77900100${item.code.replace(/\D/g, '').padStart(4, '0')}`,
    codePrefix: `${(idx % 4) + 1}u`,
    supplierId: 'sup-08',
    supplierName: item.supplier,
    supplierPhone: '+54 9 387 482-9900',
  }));
}

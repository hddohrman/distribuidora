import React from 'react';
import {
  Landmark,
  Wallet,
  PlusCircle,
  ShoppingBag,
  Inbox,
  ArrowRight,
  BadgeCheck,
  Zap,
  Calendar,
  MessageSquare,
  CheckCircle2,
  X,
  CloudDownload,
  CloudOff,
  RefreshCw,
  CloudUpload,
  CreditCard,
  ShieldCheck,
  Database,
  Trash2,
  CheckCheck,
  Download,
  AlertCircle,
  CalendarX,
  Package,
  Lock,
  LogIn,
  BookOpen,
  Banknote,
  Smartphone,
  PhoneCall,
  Printer,
  QrCode,
  Scan,
  Receipt,
  Send,
  Share2,
  Store,
  ArrowLeftRight,
  TrendingUp,
  RotateCcw,
  Upload,
  Box,
  AlertTriangle,
  Search,
  ShoppingCart,
  Check,
  Building,
  User,
  History,
  BarChart3,
  Users,
  Percent,
  DollarSign,
  Edit,
  Copy,
  FileText,
  Settings,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Tag,
} from 'lucide-react';

export type IconName =
  | 'account_balance'
  | 'account_balance_wallet'
  | 'add_circle'
  | 'add_shopping_cart'
  | 'all_inbox'
  | 'arrow_forward'
  | 'badge'
  | 'bolt'
  | 'calendar_today'
  | 'chat'
  | 'check_circle'
  | 'close'
  | 'cloud_download'
  | 'cloud_off'
  | 'cloud_sync'
  | 'cloud_upload'
  | 'credit_card'
  | 'credit_score'
  | 'database'
  | 'delete'
  | 'done_all'
  | 'download'
  | 'error'
  | 'event_busy'
  | 'inventory_2'
  | 'lock'
  | 'login'
  | 'menu_book'
  | 'payments'
  | 'phone_android'
  | 'phonelink_ring'
  | 'point_of_sale'
  | 'print'
  | 'qr_code_2'
  | 'qr_code_scanner'
  | 'receipt'
  | 'receipt_long'
  | 'refresh'
  | 'send'
  | 'send_to_mobile'
  | 'share'
  | 'store'
  | 'storefront'
  | 'swap_horiz'
  | 'sync'
  | 'task_alt'
  | 'trending_up'
  | 'update'
  | 'upload_file'
  | 'verified'
  | 'view_in_ar'
  | 'warning'
  | 'search'
  | 'shopping_cart'
  | 'history'
  | string;

interface LocalIconProps {
  name: IconName;
  className?: string;
  size?: number;
}

export const LocalIcon: React.FC<LocalIconProps> = ({
  name,
  className = 'w-5 h-5',
  size,
}) => {
  const iconProps = {
    className,
    ...(size ? { size } : {}),
  };

  switch (name) {
    case 'account_balance':
      return <Landmark {...iconProps} />;
    case 'account_balance_wallet':
      return <Wallet {...iconProps} />;
    case 'add_circle':
      return <PlusCircle {...iconProps} />;
    case 'add_shopping_cart':
    case 'shopping_cart':
      return <ShoppingCart {...iconProps} />;
    case 'all_inbox':
      return <Inbox {...iconProps} />;
    case 'arrow_forward':
      return <ArrowRight {...iconProps} />;
    case 'badge':
      return <BadgeCheck {...iconProps} />;
    case 'bolt':
      return <Zap {...iconProps} />;
    case 'calendar_today':
      return <Calendar {...iconProps} />;
    case 'chat':
      return <MessageSquare {...iconProps} />;
    case 'check_circle':
    case 'verified':
      return <CheckCircle2 {...iconProps} />;
    case 'close':
      return <X {...iconProps} />;
    case 'cloud_download':
      return <CloudDownload {...iconProps} />;
    case 'cloud_off':
      return <CloudOff {...iconProps} />;
    case 'cloud_sync':
    case 'sync':
    case 'refresh':
      return <RefreshCw {...iconProps} />;
    case 'cloud_upload':
      return <CloudUpload {...iconProps} />;
    case 'credit_card':
      return <CreditCard {...iconProps} />;
    case 'credit_score':
      return <ShieldCheck {...iconProps} />;
    case 'database':
      return <Database {...iconProps} />;
    case 'delete':
      return <Trash2 {...iconProps} />;
    case 'done_all':
      return <CheckCheck {...iconProps} />;
    case 'download':
      return <Download {...iconProps} />;
    case 'error':
      return <AlertCircle {...iconProps} />;
    case 'event_busy':
      return <CalendarX {...iconProps} />;
    case 'inventory_2':
      return <Package {...iconProps} />;
    case 'lock':
      return <Lock {...iconProps} />;
    case 'login':
      return <LogIn {...iconProps} />;
    case 'menu_book':
      return <BookOpen {...iconProps} />;
    case 'payments':
      return <Banknote {...iconProps} />;
    case 'phone_android':
      return <Smartphone {...iconProps} />;
    case 'phonelink_ring':
      return <PhoneCall {...iconProps} />;
    case 'point_of_sale':
      return <Store {...iconProps} />;
    case 'print':
      return <Printer {...iconProps} />;
    case 'qr_code_2':
      return <QrCode {...iconProps} />;
    case 'qr_code_scanner':
      return <Scan {...iconProps} />;
    case 'receipt':
    case 'receipt_long':
      return <Receipt {...iconProps} />;
    case 'send':
    case 'send_to_mobile':
      return <Send {...iconProps} />;
    case 'share':
      return <Share2 {...iconProps} />;
    case 'store':
    case 'storefront':
      return <Building {...iconProps} />;
    case 'swap_horiz':
    case 'sync_alt':
      return <ArrowLeftRight {...iconProps} />;
    case 'task_alt':
      return <Check {...iconProps} />;
    case 'trending_up':
      return <TrendingUp {...iconProps} />;
    case 'update':
      return <RotateCcw {...iconProps} />;
    case 'upload_file':
      return <Upload {...iconProps} />;
    case 'view_in_ar':
      return <Box {...iconProps} />;
    case 'warning':
      return <AlertTriangle {...iconProps} />;
    case 'search':
      return <Search {...iconProps} />;
    case 'history':
      return <History {...iconProps} />;
    case 'bar_chart':
    case 'analytics':
      return <BarChart3 {...iconProps} />;
    case 'users':
    case 'group':
      return <Users {...iconProps} />;
    case 'user':
      return <User {...iconProps} />;
    case 'percent':
      return <Percent {...iconProps} />;
    case 'dollar_sign':
    case 'monetization_on':
      return <DollarSign {...iconProps} />;
    case 'edit':
    case 'edit_note':
      return <Edit {...iconProps} />;
    case 'copy':
    case 'content_copy':
      return <Copy {...iconProps} />;
    case 'file_text':
    case 'description':
      return <FileText {...iconProps} />;
    case 'settings':
      return <Settings {...iconProps} />;
    case 'filter':
    case 'filter_list':
      return <Filter {...iconProps} />;
    case 'arrow_up_right':
      return <ArrowUpRight {...iconProps} />;
    case 'arrow_down_right':
      return <ArrowDownRight {...iconProps} />;
    case 'tag':
    case 'label':
      return <Tag {...iconProps} />;
    default:
      return <Package {...iconProps} />;
  }
};

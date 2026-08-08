/**
 * App-wide icon set. Filled Tabler icons aliased under their former lucide names
 * so they're drop-in everywhere a `LucideIcon` was used; genuinely functional
 * icons with no filled form (spinners, chevrons, arrows, close, grip, …) stay
 * lucide. Cast to `LucideIcon` so typed `icon: LucideIcon` fields keep working.
 *
 * Every app file imports icons from here (not 'lucide-react'). To make an icon
 * filled, move it from the lucide passthrough block to a `f(IconXxxFilled)` line.
 */
import {
  IconAdjustmentsHorizontalFilled,
  IconAffiliateFilled,
  IconAlertTriangleFilled,
  IconAppsFilled,
  IconBellFilled,
  IconBoltFilled,
  IconBulbFilled,
  IconBrandFacebookFilled,
  IconBrandGithubFilled,
  IconBrandLinkedinFilled,
  IconBrandXFilled,
  IconCalendarFilled,
  IconChartAreaFilled,
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconClipboardListFilled,
  IconClockFilled,
  IconCompassFilled,
  IconCreditCardFilled,
  IconEyeFilled,
  IconFileFilled,
  IconFileTextFilled,
  IconFlagFilled,
  IconFolderFilled,
  IconGaugeFilled,
  IconGiftFilled,
  IconHelpCircleFilled,
  IconInfoCircleFilled,
  IconLayoutFilled,
  IconLayoutGridFilled,
  IconLinkFilled,
  IconLockFilled,
  IconMailFilled,
  IconMessageCircleFilled,
  IconMessageFilled,
  IconMoonFilled,
  IconPencilFilled,
  IconPlayerPlayFilled,
  IconQuoteFilled,
  IconRosetteDiscountCheckFilled,
  IconSettingsFilled,
  IconShieldFilled,
  IconShoppingCartFilled,
  IconSparklesFilled,
  IconSquareRoundedCheckFilled,
  IconStackFilled,
  IconStarFilled,
  IconSunFilled,
  IconTrashFilled,
  IconUserFilled,
  IconWorldFilled,
} from '@tabler/icons-react'
import type { LucideIcon } from 'lucide-react'

export type { LucideIcon } from 'lucide-react'

const f = (c: unknown): LucideIcon => c as unknown as LucideIcon

// Filled (Tabler)
export const AlertTriangle = f(IconAlertTriangleFilled)
export const Calendar = f(IconCalendarFilled)
export const FileCode2 = f(IconFileFilled)
export const Lightbulb = f(IconBulbFilled)
export const Network = f(IconAffiliateFilled)
export const SlidersHorizontal = f(IconAdjustmentsHorizontalFilled)
export const User = f(IconUserFilled)
export const BadgeCheck = f(IconRosetteDiscountCheckFilled)
export const BarChart3 = f(IconChartAreaFilled)
export const Bell = f(IconBellFilled)
export const Blocks = f(IconAppsFilled)
export const CalendarClock = f(IconCalendarFilled)
export const CalendarDays = f(IconCalendarFilled)
export const CheckCircle2 = f(IconCircleCheckFilled)
export const ClipboardList = f(IconClipboardListFilled)
export const Compass = f(IconCompassFilled)
export const CreditCard = f(IconCreditCardFilled)
export const Eye = f(IconEyeFilled)
export const Facebook = f(IconBrandFacebookFilled)
export const FileCheck2 = f(IconFileFilled)
export const FileClock = f(IconFileFilled)
export const FileText = f(IconFileTextFilled)
export const Flag = f(IconFlagFilled)
export const FolderKanban = f(IconFolderFilled)
export const Gauge = f(IconGaugeFilled)
export const Gift = f(IconGiftFilled)
export const Github = f(IconBrandGithubFilled)
export const Globe = f(IconWorldFilled)
export const Globe2 = f(IconWorldFilled)
export const HelpCircle = f(IconHelpCircleFilled)
export const Info = f(IconInfoCircleFilled)
export const Layers = f(IconStackFilled)
export const Layout = f(IconLayoutFilled)
export const LayoutGrid = f(IconLayoutGridFilled)
export const Link2 = f(IconLinkFilled)
export const Linkedin = f(IconBrandLinkedinFilled)
export const ListChecks = f(IconSquareRoundedCheckFilled)
export const ListTodo = f(IconSquareRoundedCheckFilled)
export const Lock = f(IconLockFilled)
export const Mail = f(IconMailFilled)
export const MessageCircle = f(IconMessageCircleFilled)
export const MessageSquare = f(IconMessageFilled)
export const MessageSquareText = f(IconMessageFilled)
export const Moon = f(IconMoonFilled)
export const PenLine = f(IconPencilFilled)
export const Pencil = f(IconPencilFilled)
export const Play = f(IconPlayerPlayFilled)
export const Quote = f(IconQuoteFilled)
export const Settings = f(IconSettingsFilled)
export const Settings2 = f(IconSettingsFilled)
export const ShieldAlert = f(IconShieldFilled)
export const ShoppingBag = f(IconShoppingCartFilled)
export const Sparkles = f(IconSparklesFilled)
export const Star = f(IconStarFilled)
export const Sun = f(IconSunFilled)
export const Timer = f(IconClockFilled)
export const Trash2 = f(IconTrashFilled)
export const Twitter = f(IconBrandXFilled)
export const UserRound = f(IconUserFilled)
export const XCircle = f(IconCircleXFilled)
export const Zap = f(IconBoltFilled)

// Functional / no filled variant (lucide passthrough)
export {
  Activity,
  ArrowDown,
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Asterisk,
  Bot,
  Building2,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsUpDown,
  Code2,
  Copy,
  Crosshair,
  Download,
  ExternalLink,
  GitPullRequest,
  GripVertical,
  Inbox,
  Instagram,
  List,
  Loader,
  Loader2,
  LogOut,
  Map,
  Maximize2,
  Menu,
  Minimize2,
  Minus,
  MoreHorizontal,
  MoreVertical,
  PanelLeft,
  Paperclip,
  PartyPopper,
  Plug,
  Plus,
  Radio,
  RefreshCw,
  Rocket,
  RotateCw,
  Search,
  Store,
  Swords,
  TrendingUp,
  Unlink2,
  UserPlus,
  Users,
  Wrench,
  X,
} from 'lucide-react'

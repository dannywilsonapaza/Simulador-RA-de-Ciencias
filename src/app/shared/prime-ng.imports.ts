// Barrel de componentes PrimeNG para Angular 17+ (standalone).
// PrimeNG 19 reemplaza la mayoría de *Module por componentes/directivas standalone.
// Usa este arreglo en la propiedad 'imports' de tus componentes standalone cuando quieras
// incluir un set común de componentes.

// Ejemplo de uso:
// import { PRIMENG_IMPORTS } from './shared/prime-ng.imports';
// @Component({
//   standalone: true,
//   selector: 'app-demo',
//   templateUrl: './demo.component.html',
//   imports: [CommonModule, PRIMENG_IMPORTS]
// })

import { CommonModule } from '@angular/common';

// Botón y utilidades
import { Button } from 'primeng/button';
import { Ripple } from 'primeng/ripple';
import { Toolbar } from 'primeng/toolbar';
import { ToggleButton } from 'primeng/togglebutton';

// Formularios / inputs
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { Textarea } from 'primeng/textarea';
import { FloatLabel } from 'primeng/floatlabel';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Select } from 'primeng/select';
import { SelectButton } from 'primeng/selectbutton';
import { RadioButton } from 'primeng/radiobutton';
import { Checkbox } from 'primeng/checkbox';
import { Password } from 'primeng/password';
import { MultiSelect } from 'primeng/multiselect';
import { Listbox } from 'primeng/listbox';
import { Slider } from 'primeng/slider';
import { Calendar } from 'primeng/calendar'; // (datepicker)
import { FileUpload } from 'primeng/fileupload';

// Paneles / layout
import { Accordion } from 'primeng/accordion';
import { Panel } from 'primeng/panel';
import { Divider } from 'primeng/divider';
import { Fieldset } from 'primeng/fieldset';
import { Card } from 'primeng/card';
import { Tabs } from 'primeng/tabs';
import { Drawer } from 'primeng/drawer';
import { OverlayPanel } from 'primeng/overlaypanel';
import { Dialog } from 'primeng/dialog';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmPopup } from 'primeng/confirmpopup';

// Datos
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { Tag } from 'primeng/tag';
import { Badge } from 'primeng/badge';
import { ProgressBar } from 'primeng/progressbar';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Skeleton } from 'primeng/skeleton';

// Navegación / menús
import { Menu } from 'primeng/menu';
import { PanelMenu } from 'primeng/panelmenu';
import { Breadcrumb } from 'primeng/breadcrumb';
import { SpeedDial } from 'primeng/speeddial';
import { SplitButton } from 'primeng/splitbutton';
import { Carousel } from 'primeng/carousel';

// Mensajes / feedback
import { Toast } from 'primeng/toast';
import { Message } from 'primeng/message';
import { Tooltip } from 'primeng/tooltip';

// Otros
import { Timeline } from 'primeng/timeline';
import { OrganizationChart } from 'primeng/organizationchart';
import { Image } from 'primeng/image';
import { Avatar } from 'primeng/avatar';
import { Chip } from 'primeng/chip';
import { BadgeDirective } from 'primeng/badge';
import { IftaLabel } from 'primeng/iftalabel';

// Agrupación base (ordena por categorías)
export const PRIMENG_IMPORTS = [
  // Core
  CommonModule,
  // Form / Inputs
  InputText, InputNumber, Textarea, FloatLabel, IconField, InputIcon, Select, SelectButton,
  RadioButton, Checkbox, Password, MultiSelect, Listbox, Slider, Calendar, FileUpload,
  // Botones
  Button, ToggleButton, SplitButton, SpeedDial, Ripple,
  // Paneles / Layout
  Accordion, Panel, Divider, Fieldset, Card, Tabs, Drawer, OverlayPanel, Dialog,
  ConfirmDialog, ConfirmPopup,
  // Datos
  Table, Paginator, Tag, Badge, ProgressBar, ProgressSpinner, Skeleton,
  // Navegación / Menús
  Menu, PanelMenu, Breadcrumb, Carousel,
  // Feedback
  Toast, Message, Tooltip,
  // Otros
  Timeline, OrganizationChart, Image, Avatar, Chip, BadgeDirective, IftaLabel
];

// Re-exports opcionales si quieres importar desde este barrel
export * from 'primeng/api';

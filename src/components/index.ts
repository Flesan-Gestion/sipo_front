import { App } from "vue";
import Button from "primevue/button"
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import AutoComplete from 'primevue/autocomplete';
import Calendar from 'primevue/calendar';
import CascadeSelect from 'primevue/cascadeselect';
import Checkbox from 'primevue/checkbox';
import Dropdown from 'primevue/dropdown';
import Password from 'primevue/password';
import RadioButton from 'primevue/radiobutton';
import Textarea from 'primevue/textarea';
import ToggleButton from 'primevue/togglebutton';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ConfirmDialog from 'primevue/confirmdialog';
import Dialog from 'primevue/dialog';
import FileUpload from 'primevue/fileupload';
import Toast from 'primevue/toast';
import Message from 'primevue/message';
import ProgressSpinner from 'primevue/progressspinner';
import Carousel from 'primevue/carousel';
import MultiSelect from 'primevue/multiselect';
import Tree from "primevue/tree";
import Card from 'primevue/card';
import ConfirmPopup from 'primevue/confirmpopup';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';
import SplitButton from 'primevue/splitbutton';
import Tag from 'primevue/tag';
import SelectButton from 'primevue/selectbutton';
import Timeline from 'primevue/timeline';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Sidebar from 'primevue/sidebar';
import OverlayPanel from 'primevue/overlaypanel';
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import FormGroup from "./FormGroup.vue";
import Loader from "./Loader.vue";
import ConfirmationModal from "./ConfirmationModal.vue";
import RefreshSessionModal from "./RefreshSessionModal.vue";

export default function setGlobalComponents(app: App<Element>) {
    app
        .component('Button', Button)
        .component('InputText', InputText)
        .component('AutoComplete', AutoComplete)
        .component('Calendar', Calendar)
        .component('CascadeSelect', CascadeSelect)
        .component('Checkbox', Checkbox)
        .component('Dropdown', Dropdown)
        .component('Password', Password)
        .component('RadioButton', RadioButton)
        .component('Textarea', Textarea)
        .component('ToggleButton', ToggleButton)
        .component('DataTable', DataTable)
        .component('Column', Column)
        .component('ConfirmDialog', ConfirmDialog)
        .component('Dialog', Dialog)
        .component('FileUpload', FileUpload)
        .component('Toast', Toast)
        .component('Message', Message)
        .component('ProgressSpinner', ProgressSpinner)
        .component('Carousel', Carousel)
        .component('MultiSelect', MultiSelect)
        .component('ConfirmPopup', ConfirmPopup)
        .component('Tree', Tree)
        .component('Card', Card)
        .component('InputGroup', InputGroup)
        .component('InputGroupAddon', InputGroupAddon)
        .component('Sidebar', Sidebar)
        .component('SplitButton', SplitButton)
        .component('Tag', Tag)
        .component('SelectButton', SelectButton)
        .component('InputNumber', InputNumber)
        .component('Timeline', Timeline)
        .component('TabView', TabView)
        .component('TabPanel', TabPanel)
        .component('OverlayPanel', OverlayPanel)
        .component('Accordion', Accordion)
        .component('AccordionTab', AccordionTab)
        .component('FormGroup', FormGroup)
        .component('Loader', Loader)
        .component('ConfirmationModal', ConfirmationModal)
        .component('RefreshSessionModal', RefreshSessionModal)
}
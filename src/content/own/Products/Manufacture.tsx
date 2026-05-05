import {
  ChangeEvent,
  FormEvent,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme
} from '@mui/material';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import ArrowBackTwoToneIcon from '@mui/icons-material/ArrowBackTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import FilterListTwoToneIcon from '@mui/icons-material/FilterListTwoTone';
import Inventory2TwoToneIcon from '@mui/icons-material/Inventory2TwoTone';
import SearchTwoToneIcon from '@mui/icons-material/SearchTwoTone';
import { useNavigate } from 'react-router-dom';
import { TitleContext } from '../../../contexts/TitleContext';
import { CustomSnackBarContext } from 'src/contexts/CustomSnackBarContext';

type ManufactureRow = {
  id: string;
  name: string;
  manufacturer: string;
  modelNo: string;
  category: string;
  serialNo: string;
  site: string;
  status: 'Active' | 'In Service' | 'Under Maintenance';
};

type ManufactureFormValues = {
  name: string;
  manufacturer: string;
  modelNo: string;
  category: string;
  description: string;
  serialNumber: string;
  barcode: string;
  quantity: string;
  unit: string;
  site: string;
  location: string;
  rackShelf: string;
  vendor: string;
  cost: string;
  purchaseDate: string;
  warrantyEndDate: string;
  maintenanceType: string;
  nextServiceDate: string;
  notes: string;
  attachment: File | null;
};

type FormErrors = Partial<Record<keyof ManufactureFormValues, string>>;

const initialRows: ManufactureRow[] = [
  {
    id: 'MFG-001',
    name: 'Hydraulic Press Line',
    manufacturer: 'Atlas Machines',
    modelNo: 'HP-4400',
    category: 'Machinery',
    serialNo: 'SN-HP-22091',
    site: 'Main Plant',
    status: 'Active'
  },
  {
    id: 'MFG-002',
    name: 'Packaging Conveyor',
    manufacturer: 'Prime Automation',
    modelNo: 'PC-18X',
    category: 'Conveyor',
    serialNo: 'SN-PC-73911',
    site: 'Warehouse A',
    status: 'In Service'
  },
  {
    id: 'MFG-003',
    name: 'Cooling Tower Pump',
    manufacturer: 'FlowTech',
    modelNo: 'CTP-900',
    category: 'Utilities',
    serialNo: 'SN-CTP-51008',
    site: 'Utility Block',
    status: 'Under Maintenance'
  }
];

const emptyFormValues: ManufactureFormValues = {
  name: '',
  manufacturer: '',
  modelNo: '',
  category: '',
  description: '',
  serialNumber: '',
  barcode: '',
  quantity: '',
  unit: '',
  site: '',
  location: '',
  rackShelf: '',
  vendor: '',
  cost: '',
  purchaseDate: '',
  warrantyEndDate: '',
  maintenanceType: '',
  nextServiceDate: '',
  notes: '',
  attachment: null
};

const requiredFields: Array<keyof ManufactureFormValues> = [
  'name',
  'manufacturer',
  'modelNo',
  'category',
  'serialNumber',
  'quantity',
  'unit',
  'site',
  'location',
  'vendor',
  'cost',
  'purchaseDate',
  'warrantyEndDate',
  'maintenanceType',
  'nextServiceDate'
];

const fieldLabels: Record<keyof ManufactureFormValues, string> = {
  name: 'Name',
  manufacturer: 'Manufacturer',
  modelNo: 'Model No.',
  category: 'Category',
  description: 'Description',
  serialNumber: 'Serial Number',
  barcode: 'Barcode',
  quantity: 'Quantity',
  unit: 'Unit',
  site: 'Site',
  location: 'Location',
  rackShelf: 'Rack / Shelf',
  vendor: 'Vendor',
  cost: 'Cost ₹',
  purchaseDate: 'Purchase Date',
  warrantyEndDate: 'Warranty End Date',
  maintenanceType: 'Maintenance Type',
  nextServiceDate: 'Next Service Date',
  notes: 'Notes',
  attachment: 'Attach File'
};

const categoryOptions = ['Machinery', 'Conveyor', 'Utilities', 'Packaging'];
const unitOptions = ['Nos', 'Kg', 'Litre', 'Set'];
const siteOptions = ['Main Plant', 'Warehouse A', 'Utility Block', 'Site B'];
const locationOptions = [
  'Production Floor',
  'Assembly Bay',
  'Storage Zone',
  'Maintenance Room'
];
const vendorOptions = [
  'Acme Industrial',
  'Prime Supplies',
  'FlowTech Partners',
  'Atlas Vendor Hub'
];
const maintenanceTypeOptions = [
  'Preventive',
  'Corrective',
  'Predictive',
  'Annual Contract'
];
const statusFilters = ['All', 'Active', 'In Service', 'Under Maintenance'];

const requiredLabel = (label: string) => `${label} *`;

function Manufacture() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { setTitle } = useContext(TitleContext);
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const [rows, setRows] = useState<ManufactureRow[]>(initialRows);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null);
  const [openAddModal, setOpenAddModal] = useState<boolean>(false);
  const [formValues, setFormValues] =
    useState<ManufactureFormValues>(emptyFormValues);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  useEffect(() => {
    setTitle('Manufacture');
  }, [setTitle]);

  const filteredRows = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesStatus =
        statusFilter === 'All' || row.status === statusFilter;
      const matchesSearch =
        !normalizedSearch ||
        [
          row.id,
          row.name,
          row.manufacturer,
          row.modelNo,
          row.category,
          row.serialNo,
          row.site,
          row.status
        ]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [rows, searchQuery, statusFilter]);

  const handleOpenAddModal = () => {
    setFormValues(emptyFormValues);
    setFormErrors({});
    setOpenAddModal(true);
  };

  const handleCloseAddModal = () => {
    setOpenAddModal(false);
    setFormErrors({});
  };

  const handleFilterOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterAnchor(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchor(null);
  };

  const handleFilterSelect = (status: string) => {
    setStatusFilter(status);
    handleFilterClose();
  };

  const handleFieldChange =
    (field: keyof ManufactureFormValues) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { value } = event.target;

      setFormValues((current) => ({
        ...current,
        [field]: value
      }));

      if (formErrors[field]) {
        setFormErrors((current) => ({
          ...current,
          [field]: ''
        }));
      }
    };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;

    setFormValues((current) => ({
      ...current,
      attachment: file
    }));
  };

  const validateForm = () => {
    const errors: FormErrors = {};

    requiredFields.forEach((field) => {
      const value = formValues[field];

      if (!value || (typeof value === 'string' && !value.trim())) {
        errors[field] = `${fieldLabels[field]} is required`;
      }
    });

    if (
      formValues.quantity &&
      (!Number.isFinite(Number(formValues.quantity)) ||
        Number(formValues.quantity) <= 0)
    ) {
      errors.quantity = 'Quantity must be greater than 0';
    }

    if (
      formValues.cost &&
      (!Number.isFinite(Number(formValues.cost)) || Number(formValues.cost) < 0)
    ) {
      errors.cost = 'Cost cannot be negative';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const nextRowNumber = rows.length + 1;
    const row: ManufactureRow = {
      id: `MFG-${String(nextRowNumber).padStart(3, '0')}`,
      name: formValues.name.trim(),
      manufacturer: formValues.manufacturer.trim(),
      modelNo: formValues.modelNo.trim(),
      category: formValues.category,
      serialNo: formValues.serialNumber.trim(),
      site: formValues.site,
      status: 'Active'
    };

    setRows((current) => [row, ...current]);
    setOpenAddModal(false);
    setFormValues(emptyFormValues);
    setFormErrors({});
    showSnackBar('Manufacture added successfully', 'success');
  };

  const handleDelete = (id: string) => {
    setRows((current) => current.filter((row) => row.id !== id));
    showSnackBar('Manufacture deleted from mock table', 'success');
  };

  const handleMockEdit = () => {
    showSnackBar('Edit action is mocked for this page', 'success');
  };

  const renderTextField = (
    field: keyof ManufactureFormValues,
    options?: string[],
    props: {
      multiline?: boolean;
      rows?: number;
      type?: string;
      required?: boolean;
    } = {}
  ) => {
    const isRequired = props.required || requiredFields.includes(field);
    const error = Boolean(formErrors[field]);

    return (
      <TextField
        fullWidth
        select={Boolean(options)}
        label={
          isRequired ? requiredLabel(fieldLabels[field]) : fieldLabels[field]
        }
        value={formValues[field] as string}
        onChange={handleFieldChange(field)}
        error={error}
        helperText={formErrors[field] || ' '}
        multiline={props.multiline}
        rows={props.rows}
        type={props.type}
        InputLabelProps={
          props.type === 'date'
            ? {
                shrink: true
              }
            : undefined
        }
      >
        {options?.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </TextField>
    );
  };

  const renderSection = (
    number: string,
    title: string,
    children: React.ReactNode
  ) => (
    <Box
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
        p: 2.5,
        bgcolor: alpha(theme.palette.primary.main, 0.02)
      }}
    >
      <Typography
        variant="subtitle1"
        fontWeight={700}
        sx={{ mb: 2, color: 'text.primary' }}
      >
        {number} · {title}
      </Typography>
      <Grid container spacing={2}>
        {children}
      </Grid>
    </Box>
  );

  return (
    <>
      <Helmet>
        <title>Manufacture</title>
      </Helmet>

      <Box p={3}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'stretch', md: 'center' }}
          justifyContent="space-between"
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Tooltip title="Back">
              <IconButton
                edge="start"
                onClick={() => navigate(-1)}
                aria-label="Go back"
              >
                <ArrowBackTwoToneIcon />
              </IconButton>
            </Tooltip>
            <Typography variant="h2">Manufacture</Typography>
          </Stack>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            alignItems={{ xs: 'stretch', sm: 'center' }}
          >
            <TextField
              size="small"
              placeholder="Search manufacture"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchTwoToneIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
              sx={{ minWidth: { xs: '100%', sm: 260 } }}
            />
            <Button
              variant="outlined"
              startIcon={<FilterListTwoToneIcon />}
              onClick={handleFilterOpen}
            >
              Filter
            </Button>
            <Button
              variant="contained"
              startIcon={<AddTwoToneIcon />}
              onClick={handleOpenAddModal}
            >
              Add Manufacture
            </Button>
          </Stack>
        </Stack>

        <Card sx={{ borderRadius: 1 }}>
          <CardContent sx={{ p: 0 }}>
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Manufacturer</TableCell>
                    <TableCell>Model No.</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Serial No.</TableCell>
                    <TableCell>Site</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRows.map((row) => (
                    <TableRow hover key={row.id}>
                      <TableCell>{row.id}</TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">{row.name}</Typography>
                      </TableCell>
                      <TableCell>{row.manufacturer}</TableCell>
                      <TableCell>{row.modelNo}</TableCell>
                      <TableCell>{row.category}</TableCell>
                      <TableCell>{row.serialNo}</TableCell>
                      <TableCell>{row.site}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.status}
                          size="small"
                          color={
                            row.status === 'Under Maintenance'
                              ? 'warning'
                              : 'success'
                          }
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            aria-label={`Edit ${row.name}`}
                            onClick={handleMockEdit}
                          >
                            <EditTwoToneIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            aria-label={`Delete ${row.name}`}
                            onClick={() => handleDelete(row.id)}
                          >
                            <DeleteTwoToneIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!filteredRows.length && (
                    <TableRow>
                      <TableCell colSpan={9}>
                        <Box
                          sx={{
                            py: 8,
                            textAlign: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            flexDirection: 'column',
                            gap: 1
                          }}
                        >
                          <Inventory2TwoToneIcon
                            sx={{ fontSize: 48, color: 'text.disabled' }}
                          />
                          <Typography variant="h4">
                            No manufacture records found
                          </Typography>
                          <Typography color="text.secondary" variant="body2">
                            Add a manufacture item or adjust your search and
                            filter.
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>

      <Menu
        anchorEl={filterAnchor}
        open={Boolean(filterAnchor)}
        onClose={handleFilterClose}
      >
        {statusFilters.map((status) => (
          <MenuItem
            key={status}
            selected={statusFilter === status}
            onClick={() => handleFilterSelect(status)}
          >
            {status}
          </MenuItem>
        ))}
      </Menu>

      <Dialog
        open={openAddModal}
        onClose={handleCloseAddModal}
        maxWidth="lg"
        fullWidth
      >
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <DialogTitle>
            <Typography variant="h3">Add Manufacture</Typography>
          </DialogTitle>
          <Divider />
          <DialogContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2.5,
              bgcolor: 'background.default'
            }}
          >
            {renderSection(
              '01',
              'Basic Info',
              <>
                <Grid item xs={12} md={6}>
                  {renderTextField('name')}
                </Grid>
                <Grid item xs={12} md={6}>
                  {renderTextField('manufacturer')}
                </Grid>
                <Grid item xs={12} md={6}>
                  {renderTextField('modelNo')}
                </Grid>
                <Grid item xs={12} md={6}>
                  {renderTextField('category', categoryOptions)}
                </Grid>
                <Grid item xs={12}>
                  {renderTextField('description', undefined, {
                    multiline: true,
                    rows: 3
                  })}
                </Grid>
              </>
            )}

            {renderSection(
              '02',
              'Product',
              <>
                <Grid item xs={12} md={6}>
                  {renderTextField('serialNumber')}
                </Grid>
                <Grid item xs={12} md={6}>
                  {renderTextField('barcode')}
                </Grid>
                <Grid item xs={12} md={6}>
                  {renderTextField('quantity', undefined, {
                    type: 'number'
                  })}
                </Grid>
                <Grid item xs={12} md={6}>
                  {renderTextField('unit', unitOptions)}
                </Grid>
              </>
            )}

            {renderSection(
              '03',
              'Location',
              <>
                <Grid item xs={12} md={4}>
                  {renderTextField('site', siteOptions)}
                </Grid>
                <Grid item xs={12} md={4}>
                  {renderTextField('location', locationOptions)}
                </Grid>
                <Grid item xs={12} md={4}>
                  {renderTextField('rackShelf')}
                </Grid>
              </>
            )}

            {renderSection(
              '04',
              'Vendor',
              <>
                <Grid item xs={12} md={4}>
                  {renderTextField('vendor', vendorOptions)}
                </Grid>
                <Grid item xs={12} md={4}>
                  {renderTextField('cost', undefined, {
                    type: 'number'
                  })}
                </Grid>
                <Grid item xs={12} md={4}>
                  {renderTextField('purchaseDate', undefined, {
                    type: 'date'
                  })}
                </Grid>
              </>
            )}

            {renderSection(
              '05',
              'Maintenance',
              <>
                <Grid item xs={12} md={4}>
                  {renderTextField('warrantyEndDate', undefined, {
                    type: 'date'
                  })}
                </Grid>
                <Grid item xs={12} md={4}>
                  {renderTextField('maintenanceType', maintenanceTypeOptions)}
                </Grid>
                <Grid item xs={12} md={4}>
                  {renderTextField('nextServiceDate', undefined, {
                    type: 'date'
                  })}
                </Grid>
              </>
            )}

            {renderSection(
              '06',
              'Notes',
              <>
                <Grid item xs={12}>
                  {renderTextField('notes', undefined, {
                    multiline: true,
                    rows: 4
                  })}
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="file"
                    label={fieldLabels.attachment}
                    onChange={handleFileChange}
                    helperText={formValues.attachment?.name || ' '}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={handleCloseAddModal}>Cancel</Button>
            <Button type="submit" variant="contained">
              Submit
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </>
  );
}

export default Manufacture;

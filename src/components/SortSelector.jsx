// components/SortSelector.js
import { FormControl, Select, MenuItem, InputLabel, Box } from '@mui/material';
import SortIcon from '@mui/icons-material/Sort';

const SortSelector = ({ sortOption, onSortChange }) => {
  const handleChange = (event) => {
    onSortChange(event.target.value);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <FormControl size="small" sx={{ minWidth: 180 }}>
        <InputLabel id="sort-select-label">Sort Results</InputLabel>
        <Select
          labelId="sort-select-label"
          id="sort-select"
          value={sortOption}
          onChange={handleChange}
          label="Sort Results"
          startAdornment={<SortIcon sx={{ mr: 1, color: 'action.active' }} fontSize="small" />}
        >
          <MenuItem value="recommended">Recommended</MenuItem>
          <MenuItem value="similarityDesc">Highest Similarity</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default SortSelector;
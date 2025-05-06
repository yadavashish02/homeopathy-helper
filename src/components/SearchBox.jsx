// components/SearchBox.js
import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const SearchBox = ({ query, setQuery, isLoading }) => {
  return (
    <TextField
      label="Enter symptoms"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="e.g., headache worse on right side, thirst..."
      disabled={isLoading}
      fullWidth
      variant="outlined"
      multiline
      minRows={1}
      maxRows={4}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon color="action" />
          </InputAdornment>
        ),
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: 2,
        }
      }}
    />
  );
};

export default SearchBox;
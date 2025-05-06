// components/SourceFilter.jsx
import React from 'react';
import { 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  OutlinedInput, 
  Chip, 
  Box, 
  CircularProgress,
  useTheme,
  alpha,
  Typography,
  Tooltip,
  IconButton
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';

const SourceFilter = ({ sources, selectedSources, onChange, isLoading }) => {
  const theme = useTheme();

  const handleChange = (event) => {
    const { value } = event.target;
    onChange(typeof value === 'string' ? value.split(',') : value);
  };

  const handleClearAll = (event) => {
    event.stopPropagation();
    onChange([]);
  };

  return (
    <FormControl 
      fullWidth
      sx={{ 
        minWidth: 150,
        '& .MuiOutlinedInput-root': {
          borderRadius: 2,
        }
      }}
    >
      <InputLabel 
        id="source-filter-label"
        sx={{ 
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
        }}
      >
        <FilterListIcon fontSize="small" sx={{ mt: -0.5 }} />
        Filter Sources
      </InputLabel>
      
      {isLoading ? (
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: 56,
            border: `1px solid ${alpha(theme.palette.text.primary, 0.23)}`,
            borderRadius: 2,
          }}
        >
          <CircularProgress size={24} color="primary" />
        </Box>
      ) : (
        <Select
          labelId="source-filter-label"
          multiple
          value={selectedSources}
          onChange={handleChange}
          input={<OutlinedInput label="Filter Sources" />}
          renderValue={(selected) => (
            <Box 
              sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 0.5,
                maxWidth: '100%',
                overflow: 'hidden'
              }}
            >
              {selected.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  All sources
                </Typography>
              ) : selected.length > 2 ? (
                <Chip 
                  label={`${selected.length} sources selected`}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ 
                    borderRadius: '4px',
                    fontWeight: 500
                  }}
                />
              ) : (
                selected.map((value) => (
                  <Chip 
                    key={value} 
                    label={value}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ 
                      borderRadius: '4px',
                      fontWeight: 500
                    }}
                  />
                ))
              )}
            </Box>
          )}
          disabled={isLoading || sources.length === 0}
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: 300,
                width: 250,
                borderRadius: 8
              },
            },
          }}
          endAdornment={
            selectedSources.length > 0 && (
              <Tooltip title="Clear all filters">
                <IconButton
                  size="small"
                  onClick={handleClearAll}
                  sx={{ 
                    position: 'absolute',
                    right: 30,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: theme.palette.text.secondary,
                    '&:hover': { color: theme.palette.error.main }
                  }}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )
          }
        >
          {sources.length === 0 ? (
            <MenuItem disabled>No sources available</MenuItem>
          ) : (
            sources.map((source) => (
              <MenuItem key={source} value={source}>
                {source}
              </MenuItem>
            ))
          )}
        </Select>
      )}
    </FormControl>
  );
};

export default SourceFilter;
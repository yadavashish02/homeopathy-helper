// pages/index.js
import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import SourceFilter from '../components/SourceFilter';
import ResultItem from '../components/ResultItem';
import { 
  Container, 
  Box, 
  TextField, 
  Button, 
  Typography, 
  CircularProgress, 
  Alert,
  Paper,
  alpha,
  useTheme,
  useMediaQuery,
  Divider,
  Fade,
  Stack,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export default function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availableSources, setAvailableSources] = useState([]);
  const [selectedSources, setSelectedSources] = useState([]);
  const [loadingSources, setLoadingSources] = useState(true);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [showFilterOptions, setShowFilterOptions] = useState(false);

  useEffect(() => {
    const fetchSources = async () => {
      setLoadingSources(true);
      try {
        const response = await fetch('/api/sources');
        if (!response.ok) {
          throw new Error('Failed to fetch sources');
        }
        const sourcesData = await response.json();
        setAvailableSources(sourcesData);
      } catch (err) {
        console.error("Error fetching sources:", err);
        setError('Could not load source filter options.');
      } finally {
        setLoadingSources(false);
      }
    };
    fetchSources();
  }, []);

  const handleSearch = useCallback(async (event) => {
    event.preventDefault();
  
    if (!query.trim()) {
      setError('Please enter symptoms to search.');
      setResults([]); // Clear results if query is invalid
      return;
    }
  
    setIsLoading(true);
    setError(null);
    setResults([]); // Clear previous results before starting a new search
  
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim(), sources: selectedSources })
      });
  
      if (!response.ok) {
        let errorMsg = `Error: ${response.status}`;
        try {
          const errData = await response.json();
          errorMsg = errData.error || errData.message || errorMsg;
        } catch (e) {
          errorMsg = 'Error parsing error response from server.';
        }
        throw new Error(errorMsg);
      }
  
      const data = await response.json();
  
      if (!Array.isArray(data)) {
        throw new Error('Invalid response structure: Expected an array of results.');
      }
  
      setResults(data);
  
      if (data.length === 0) {
        setError('No matching solutions found for your query and filter.');
      }
  
    } catch (err) {
      console.error('Search failed:', err);
      setError(err.message || 'An unexpected error occurred during search.');
      setResults([]); // Optionally reset results on error
    } finally {
      setIsLoading(false);
    }
  }, [query, selectedSources]);

  const toggleFilterOptions = () => {
    setShowFilterOptions(!showFilterOptions);
  };

  return (
    <>
      <Head>
        <title>Homeopathic Symptom Search</title>
        <meta name="description" content="Search for homeopathic solutions based on symptoms" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 } }}>
        <Box 
          sx={{ 
            my: { xs: 4, md: 6 },
            textAlign: 'center' 
          }}
        >
          {/* Hero Section */}
          <Box 
            sx={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 5
            }}
          >
            <HealthAndSafetyIcon 
              sx={{ 
                fontSize: { xs: 48, md: 56 },
                color: theme.palette.primary.main,
                mb: 2
              }} 
            />
            
            <Typography 
              variant="h3" 
              component="h1" 
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' },
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2
              }}
            >
              Homeopathic Symptom Search
            </Typography>

            <Typography 
              variant="subtitle1" 
              sx={{ 
                maxWidth: '600px',
                color: theme.palette.text.secondary,
                fontSize: { xs: '0.9rem', sm: '1rem' }
              }}
            >
              Enter symptoms and discover potential homeopathic solutions tailored to your needs
            </Typography>
          </Box>

          {/* Search Form */}
          <Paper 
            elevation={3} 
            sx={{ 
              p: { xs: 3, md: 4 },
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease',
            }}
          >
            <Box 
              component="form" 
              onSubmit={handleSearch} 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 3
              }}
            >
              <TextField
                label="Enter symptoms"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., headache worse on right side, thirst..."
                disabled={isLoading}
                fullWidth
                variant="outlined"
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

              {/* Filter Toggle Button (Mobile) */}
              {isMobile && (
                <Button
                  variant="outlined"
                  onClick={toggleFilterOptions}
                  endIcon={
                    <KeyboardArrowDownIcon
                      sx={{
                        transform: showFilterOptions ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s'
                      }}
                    />
                  }
                  sx={{ mb: 1 }}
                >
                  Filter by Sources
                </Button>
              )}

              {/* Filter Options */}
              <Fade in={!isMobile || showFilterOptions}>
                <Box>
                  <SourceFilter
                    sources={availableSources}
                    selectedSources={selectedSources}
                    onChange={setSelectedSources}
                    isLoading={loadingSources}
                  />
                </Box>
              </Fade>

              <Button 
                type="submit" 
                variant="contained" 
                disabled={isLoading} 
                size="large"
                disableElevation
                sx={{ 
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '1rem',
                  boxShadow: theme.shadows[2],
                  '&:hover': {
                    boxShadow: theme.shadows[4],
                  }
                }}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Search Solutions'
                )}
              </Button>
            </Box>
          </Paper>

          {/* Error Message */}
          {error && (
            <Box sx={{ mt: 3 }}>
              <Alert 
                severity="error"
                variant="filled"
                sx={{ 
                  borderRadius: 2,
                  '& .MuiAlert-message': {
                    fontWeight: 500
                  }
                }}
              >
                {error}
              </Alert>
            </Box>
          )}

          {/* Results Section */}
          <Box 
            sx={{ 
              mt: 5,
              minHeight: results.length > 0 ? 'auto' : '100px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: results.length > 0 ? 'flex-start' : 'center'
            }}
          >
            {/* Loading State */}
            {isLoading && (
              <Stack direction="column" spacing={2} alignItems="center" sx={{ my: 6 }}>
                <CircularProgress size={40} />
                <Typography variant="body1" color="text.secondary">
                  Searching for matching solutions...
                </Typography>
              </Stack>
            )}
            
            {/* Empty State */}
            {!isLoading && results.length === 0 && !error && (
              <Box 
                sx={{ 
                  textAlign: 'center',
                  py: 6,
                  px: 2,
                  maxWidth: 500,
                  margin: '0 auto'
                }}
              >
                <SearchIcon 
                  sx={{ 
                    fontSize: 48, 
                    color: alpha(theme.palette.text.secondary, 0.5),
                    mb: 2
                  }} 
                />
                <Typography 
                  variant="h6" 
                  color="textSecondary" 
                  sx={{ mb: 1, fontWeight: 600 }}
                >
                  Ready to find solutions
                </Typography>
                <Typography color="textSecondary">
                  Enter your symptoms above and click Search to discover potential homeopathic remedies.
                </Typography>
              </Box>
            )}

            {/* Results List */}
            {!isLoading && results.length > 0 && (
              <Box sx={{ width: '100%' }}>
                <Divider sx={{ my: 4 }} />
                
                <Typography 
                  variant="h5" 
                  sx={{ 
                    mb: 3, 
                    textAlign: 'left',
                    fontWeight: 600
                  }}
                >
                  Search Results ({results.length})
                </Typography>
                
                {results.map((result, index) => (
                  <ResultItem key={`${result.solution}-${index}`} result={result} />
                ))}
              </Box>
            )}
          </Box>

          {/* Disclaimer */}
          <Paper 
            elevation={0} 
            sx={{ 
              mt: 8, 
              mb: 4, 
              p: 3,
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.background.paper, 0.5),
              border: `1px solid ${alpha(theme.palette.divider, 0.5)}`
            }}
          >
            <Stack 
              direction="row" 
              spacing={1}
              alignItems="center"
              justifyContent="center"
            >
              <InfoOutlinedIcon 
                color="action" 
                fontSize="small" 
              />
              <Typography 
                variant="body2" 
                color="textSecondary" 
                align="center"
                sx={{ fontStyle: 'italic' }}
              >
                Disclaimer: Information is for educational purposes only. Consult a qualified practitioner.
              </Typography>
            </Stack>
          </Paper>
        </Box>
      </Container>
    </>
  );
}
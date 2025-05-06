'use client';
import React, { useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Collapse,
  Chip,
  CircularProgress,
  Stack,
  Box,
  Divider,
  LinearProgress,
  alpha,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import SourceIcon from '@mui/icons-material/Source';
import { useTheme } from '@mui/material/styles';

const ResultItem = ({ result }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [details, setDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState(null);
  const theme = useTheme();

  const fetchDetails = useCallback(async () => {
    if (details || isLoadingDetails) return;
    setIsLoadingDetails(true);
    setDetailsError(null);
    try {
      const response = await fetch(`/api/solution/${encodeURIComponent(result.solution)}`);
      if (!response.ok) throw new Error('Failed to fetch details');
      const data = await response.json();
      setDetails(data);
    } catch (err) {
      setDetailsError(err.message || 'Unknown error');
    } finally {
      setIsLoadingDetails(false);
    }
  }, [result.solution, details, isLoadingDetails]);

  const toggleExpansion = () => {
    const expanding = !isExpanded;
    setIsExpanded(expanding);
    if (expanding && !details) {
      fetchDetails();
    }
  };

  // Calculate color based on similarity percentage
  const getMatchColor = (similarity) => {
    if (similarity >= 80) return theme.palette.success.main;
    if (similarity >= 70) return theme.palette.warning.main;
    return theme.palette.error.main;
  };
  
  const matchColor = getMatchColor(result.similarity);

  return (
    <Card 
      elevation={3} 
      sx={{ 
        mb: 2, 
        borderRadius: 2,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 6,
        },
        overflow: 'hidden',
      }}
    >
      <Box 
        sx={{ 
          width: '100%', 
          height: 6, 
          backgroundColor: matchColor,
        }} 
      />
      
      <CardContent 
        onClick={toggleExpansion} 
        sx={{ 
          cursor: 'pointer',
          p: { xs: 2, sm: 3 },
        }}
      >
        {/* Top Summary */}
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          justifyContent="space-between" 
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={1}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <MedicalServicesIcon 
              sx={{ 
                mr: 1.5, 
                color: theme.palette.primary.main,
                fontSize: '1.5rem',
              }} 
            />
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600,
                fontSize: { xs: '1.1rem', sm: '1.25rem' } 
              }}
            >
              {result.solution}
            </Typography>
          </Box>

          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: { xs: 'flex-start', sm: 'flex-end' },
              ml: { xs: 3.5, sm: 0 }
            }}
          >
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 500,
                color: 'text.secondary',
                mb: 0.5,
              }}
            >
              Match Score
            </Typography>
            <Box sx={{ position: 'relative', width: '100%', minWidth: 100 }}>
              <LinearProgress 
                variant="determinate" 
                value={result.similarity} 
                sx={{ 
                  height: 8, 
                  borderRadius: 1,
                  backgroundColor: alpha(matchColor, 0.2),
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: matchColor,
                  }
                }} 
              />
              <Typography 
                variant="caption" 
                sx={{ 
                  position: 'absolute', 
                  top: '-2px', 
                  right: '-28px',
                  fontWeight: 700,
                  color: matchColor,
                }}
              >
                {result.similarity}%
              </Typography>
            </Box>
          </Box>
        </Stack>

        {/* Sources */}
        {result.sources?.length > 0 && (
          <Stack 
            direction="row" 
            alignItems="center"
            sx={{ 
              mt: 2,
              overflow: 'hidden',
            }}
          >
            <SourceIcon 
              sx={{ 
                fontSize: '0.9rem', 
                mr: 1, 
                color: theme.palette.text.secondary 
              }} 
            />
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {result.sources.join(', ')}
            </Typography>
          </Stack>
        )}

        {/* Matching Organs */}
        {result.matching_organs?.length > 0 && (
          <Stack 
            direction="row" 
            flexWrap="wrap" 
            spacing={1} 
            sx={{ 
              mt: 2,
              gap: 1,
            }}
          >
            {result.matching_organs.map((organ) => (
              <Chip
                key={organ}
                label={organ}
                icon={<CheckCircleIcon sx={{ fontSize: '0.9rem' }} />}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ 
                  borderRadius: '4px',
                  '& .MuiChip-label': {
                    px: 1,
                  },
                }}
              />
            ))}
          </Stack>
        )}
      </CardContent>

      <CardActions 
        disableSpacing 
        sx={{ 
          justifyContent: 'center',
          p: 0,
        }}
      >
        <IconButton 
          onClick={toggleExpansion} 
          aria-expanded={isExpanded}
          sx={{
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s',
            color: theme.palette.primary.main,
          }}
        >
          <ExpandMoreIcon />
        </IconButton>
      </CardActions>

      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
        <Divider sx={{ mx: 2 }} />
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          {/* Loading State */}
          {isLoadingDetails && (
            <Stack direction="row" alignItems="center" spacing={1} sx={{ py: 2 }}>
              <CircularProgress size={20} color="primary" />
              <Typography variant="body2">Loading details...</Typography>
            </Stack>
          )}

          {/* Error State */}
          {detailsError && (
            <Box 
              sx={{ 
                p: 2, 
                borderRadius: 1,
                backgroundColor: alpha(theme.palette.error.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <ErrorOutlineIcon color="error" />
              <Typography variant="body2" color="error.main">
                Error: {detailsError}
              </Typography>
            </Box>
          )}

          {/* Loaded Details */}
          {details && (
            <Stack spacing={3}>
              {details.description && (
                <Box>
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      mb: 1,
                      fontWeight: 600,
                      color: theme.palette.primary.main,
                    }}
                  >
                    Description
                  </Typography>
                  <Typography 
                    variant="body2"
                    sx={{
                      lineHeight: 1.6,
                    }}
                  >
                    {details.description}
                  </Typography>
                </Box>
              )}
              
              {details.characteristics && (
                <Box>
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      mb: 1,
                      fontWeight: 600,
                      color: theme.palette.primary.main,
                    }}
                  >
                    Characteristics
                  </Typography>
                  <Typography 
                    variant="body2"
                    sx={{
                      lineHeight: 1.6,
                    }}
                  >
                    {details.characteristics}
                  </Typography>
                </Box>
              )}
              
              {details.relations && (
                <Box>
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      mb: 1,
                      fontWeight: 600,
                      color: theme.palette.primary.main,
                    }}
                  >
                    Relations
                  </Typography>
                  <Typography 
                    variant="body2"
                    sx={{
                      lineHeight: 1.6,
                    }}
                  >
                    {details.relations}
                  </Typography>
                </Box>
              )}

              {/* Full Symptoms List */}
              {details.symptoms && typeof details.symptoms === 'object' && Object.keys(details.symptoms).length > 0 && (
                <Box>
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      mb: 1,
                      fontWeight: 600,
                      color: theme.palette.primary.main,
                    }}
                  >
                    Full Symptom List
                  </Typography>
                  <Stack spacing={1.5}>
                    {Object.entries(details.symptoms).map(([organKey, symptoms]) => (
                      <Box 
                        key={organKey} 
                        sx={{ 
                          p: 1.5,
                          borderRadius: 1,
                          backgroundColor: alpha(theme.palette.background.default, 0.7),
                          border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                        }}
                      >
                        <Typography 
                          variant="subtitle2"
                          sx={{
                            fontWeight: 600,
                            color: theme.palette.text.primary,
                            mb: 0.5,
                          }}
                        >
                          {organKey}
                        </Typography>
                        <Typography variant="body2">
                          {symptoms}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}
            </Stack>
          )}
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default ResultItem;
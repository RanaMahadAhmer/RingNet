import React, { useMemo } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress, Divider, Chip } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import {
  WbSunny as SunIcon,
  Air as WindIcon,
  WaterDrop as HumidityIcon,
  Thermostat as TemperatureIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  Cloud as CloudIcon,
  Opacity as RainIcon,
  NightsStay as NightIcon,
  Grain as HazeIcon,
  Thunderstorm as StormIcon,
  AcUnit as SnowIcon,
  FilterDrama as PartlyCloudyIcon,
  CalendarToday as CalendarIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

interface ForecastDay {
  date: string;
  temperature: number;
  description: string;
  isHeatwave: boolean;
}

interface WeatherData {
  clusterId: string;
  description: string;
  feelsLike: number;
  humidity: number;
  location: {
    latitude: number;
    longitude: number;
    placeName: string;
  };
  temperature: number;
  timestamp: string;
  userCount: number;
  windSpeed: number;
  alerts?: Array<any>;
  metadata?: {
    forecast?: ForecastDay[];
    heatwaveAlert?: boolean;
  };
}

interface WeatherCardProps {
  weatherData: WeatherData;
  isLoading?: boolean;
}

// Add this type definition at the top with other interfaces
type WeatherType = 'clear' | 'cloudy' | 'rainy' | 'stormy' | 'snowy' | 'foggy' | 'night';

// Styled components
const WeatherContainer = styled(Paper)(() => ({
  borderRadius: 16,
  overflow: 'hidden',
  boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
  padding: 0,
  marginBottom: 30,
}));

const WeatherHeader = styled(Box)<{ weatherType: WeatherType }>(({ theme, weatherType }) => {
  // More subtle, theme-consistent gradients
  const gradients = {
    clear: `linear-gradient(to right, ${theme.palette.background.paper}, ${theme.palette.primary.light}15)`,
    cloudy: `linear-gradient(to right, ${theme.palette.background.paper}, ${theme.palette.grey[200]})`,
    rainy: `linear-gradient(to right, ${theme.palette.background.paper}, ${theme.palette.info.light}15)`,
    stormy: `linear-gradient(to right, ${theme.palette.background.paper}, ${theme.palette.grey[300]})`,
    snowy: `linear-gradient(to right, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
    foggy: `linear-gradient(to right, ${theme.palette.background.paper}, ${theme.palette.grey[100]})`,
    night: `linear-gradient(to right, ${theme.palette.background.paper}, ${theme.palette.grey[200]})`,
  };

  return {
    background: gradients[weatherType],
    color: theme.palette.text.primary,
    padding: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderBottom: `1px solid ${theme.palette.divider}`,
  };
});

const TempDisplay = styled(Box)(({ theme }) => ({
  fontSize: '3rem',
  fontWeight: 500,
  marginBottom: theme.spacing(1),
  zIndex: 1,
  display: 'flex',
  alignItems: 'baseline',
  color: "#bc1a1a",
  '& small': {
    fontSize: '1.5rem',
    opacity: 0.8,
    marginLeft: theme.spacing(0.5),
  },
}));

const IconContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  '& svg': {
    fontSize: '3rem',
    color: "#bc1a1a",
    filter: 'none',
  },
}));

const WeatherDetails = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
}));

const DetailItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  '& svg': {
    marginRight: theme.spacing(1.5),
    color: "#bc1a1a",
  },
}));

const WeatherLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(0.5),
}));

const WeatherValue = styled(Typography)(() => ({
  fontSize: '1.125rem',
  fontWeight: 500,
}));

const LocationChip = styled(Chip)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  left: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: theme.shadows[1],
  '& .MuiChip-icon': {
    color: "#bc1a1a",
  },
}));

const TimeChip = styled(Chip)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  right: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: theme.shadows[1],
  '& .MuiChip-icon': {
    color: "#bc1a1a",
  },
}));

// Add new styled components for forecast section
const ForecastSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
  borderTop: `1px solid ${theme.palette.divider}`,
}));

const ForecastDay = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-3px)',
  }
}));

const ForecastTemp = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 500,
  color: "#bc1a1a",
  display: 'flex',
  alignItems: 'baseline',
  '& small': {
    fontSize: '0.875rem',
    opacity: 0.8,
    marginLeft: theme.spacing(0.5),
  },
}));

const HeatwaveChip = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.error.light,
  color: theme.palette.error.contrastText,
  marginTop: theme.spacing(1),
  '& .MuiChip-icon': {
    color: theme.palette.error.contrastText,
  },
}));

const WeatherCard: React.FC<WeatherCardProps> = ({ weatherData, isLoading = false }) => {
  const theme = useTheme();
  // Update the useMemo return type
  const { weatherIcon, weatherType } = useMemo<{ weatherIcon: JSX.Element; weatherType: WeatherType }>(() => {
    if (!weatherData) return { weatherIcon: <CloudIcon />, weatherType: 'cloudy' };

    const description = weatherData.description.toLowerCase();
    
    // Check if it's night time
    const date = new Date(weatherData.timestamp);
    const hours = date.getHours();
    const isNightTime = hours >= 19 || hours <= 5;
    
    if (isNightTime && description.includes('clear')) {
      return { weatherIcon: <NightIcon />, weatherType: 'night' };
    }
    
    if (description.includes('clear') || description.includes('sun')) {
      return { weatherIcon: <SunIcon />, weatherType: 'clear' };
    } else if (description.includes('rain') || description.includes('drizzle')) {
      return { weatherIcon: <RainIcon />, weatherType: 'rainy' };
    } else if (description.includes('thunder') || description.includes('storm')) {
      return { weatherIcon: <StormIcon />, weatherType: 'stormy' };
    } else if (description.includes('snow')) {
      return { weatherIcon: <SnowIcon />, weatherType: 'snowy' };
    } else if (description.includes('mist') || description.includes('fog') || description.includes('haze')) {
      return { weatherIcon: <HazeIcon />, weatherType: 'foggy' };
    } else if (description.includes('few clouds') || description.includes('scattered clouds')) {
      return { weatherIcon: <PartlyCloudyIcon />, weatherType: 'cloudy' };
    } else if (description.includes('cloud')) {
      return { weatherIcon: <CloudIcon />, weatherType: 'cloudy' };
    }
    
    return { weatherIcon: <SunIcon />, weatherType: 'clear' };
  }, [weatherData]);

  // Function to get weather icon based on description
  const getWeatherIconForDescription = (description: string) => {
    const desc = description.toLowerCase();
    
    if (desc.includes('clear') || desc.includes('sun')) {
      return <SunIcon />;
    } else if (desc.includes('rain') || desc.includes('drizzle')) {
      return <RainIcon />;
    } else if (desc.includes('thunder') || desc.includes('storm')) {
      return <StormIcon />;
    } else if (desc.includes('snow')) {
      return <SnowIcon />;
    } else if (desc.includes('mist') || desc.includes('fog') || desc.includes('haze')) {
      return <HazeIcon />;
    } else if (desc.includes('few clouds') || desc.includes('scattered clouds')) {
      return <PartlyCloudyIcon />;
    } else if (desc.includes('cloud')) {
      return <CloudIcon />;
    }
    
    return <SunIcon />;
  };

  // Format date to display in a user-friendly way
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!weatherData) {
    return null;
  }

 

  // Get user-friendly timestamp (e.g., "10 minutes ago")
  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const pastDate = new Date(timestamp);
    const diffMs = now.getTime() - pastDate.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  // Check if forecast data exists
  const hasForecast = weatherData.metadata && 
                      weatherData.metadata.forecast && 
                      weatherData.metadata.forecast.length > 0;

  return (
    <WeatherContainer elevation={0}>
      <WeatherHeader weatherType={weatherType}>
        <LocationChip 
          icon={<LocationIcon />} 
          label={weatherData.location.placeName} 
          size="small"
        />
        <TimeChip
          icon={<TimeIcon />}
          label={getTimeAgo(weatherData.timestamp)}
          size="small"
        />
        
        <IconContainer>
          {weatherIcon}
        </IconContainer>
        
        <TempDisplay>
          {Math.round(weatherData.temperature)}<small>°C</small>
        </TempDisplay>
        
        <Typography variant="h6" sx={{ textTransform: 'capitalize', fontWeight: 500, mb: 1, zIndex: 1 }}>
          {weatherData.description}
        </Typography>
        
        <Typography variant="body2" sx={{ opacity: 0.9, zIndex: 1 }}>
          Feels like {Math.round(weatherData.feelsLike)}°C
        </Typography>
      </WeatherHeader>
      
      <WeatherDetails>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <DetailItem>
              <TemperatureIcon sx={{color: "#bc1a1a"}}/>
              <Box>
                <WeatherLabel>Temperature</WeatherLabel>
                <WeatherValue>{weatherData.temperature.toFixed(1)}°C</WeatherValue>
              </Box>
            </DetailItem>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <DetailItem>
              <HumidityIcon sx={{color: "#bc1a1a"}}/>
              <Box>
                <WeatherLabel>Humidity</WeatherLabel>
                <WeatherValue>{weatherData.humidity}%</WeatherValue>
              </Box>
            </DetailItem>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <DetailItem>
              <WindIcon sx={{color: "#bc1a1a"}}/>
              <Box>
                <WeatherLabel>Wind Speed</WeatherLabel>
                <WeatherValue>{weatherData.windSpeed.toFixed(1)} m/s</WeatherValue>
              </Box>
            </DetailItem>
          </Grid>
        </Grid>
        
        {weatherData.alerts && weatherData.alerts.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" fontWeight={500} sx={{ mb: 1 }}>
              Weather Alerts
            </Typography>
            {weatherData.alerts.map((alert, index) => (
              <Box 
                key={index} 
                sx={{ 
                  mb: 1, 
                  p: 1, 
                  bgcolor: theme.palette.warning.light + '20', // Very subtle background
                  borderLeft: `3px solid ${theme.palette.warning.main}`,
                  borderRadius: 1 
                }}
              >
                <Typography variant="body2" fontWeight={500}>{alert.event}</Typography>
                <Typography variant="caption">{alert.description}</Typography>
              </Box>
            ))}
          </>
        )}
      </WeatherDetails>
      
      {/* Add Forecast Section */}
      {hasForecast && (
        <ForecastSection>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CalendarIcon sx={{ color: "#bc1a1a", mr: 1 }} />
            <Typography variant="h6" fontWeight={500}>
              5-Day Forecast
            </Typography>
          </Box>
          
          <Grid container spacing={2}>
            {weatherData.metadata?.forecast?.slice(0, 5).map((day, index) => (
              <Grid item xs={6} sm={4} md={2.4} key={index}>
                <ForecastDay>
                  <Typography variant="subtitle2" fontWeight={500} sx={{ mb: 1 }}>
                    {formatDate(day.date)}
                  </Typography>
                  
                  <Box sx={{ my: 1 }}>
                    {getWeatherIconForDescription(day.description)}
                  </Box>
                  
                  <ForecastTemp>
                    {Math.round(day.temperature)}<small>°C</small>
                  </ForecastTemp>
                  
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      textAlign: 'center', 
                      display: 'block',
                      textTransform: 'capitalize',
                      mt: 1
                    }}
                  >
                    {day.description}
                  </Typography>
                  
                  {day.isHeatwave && (
                    <HeatwaveChip
                      icon={<WarningIcon />}
                      label="Heatwave"
                      size="small"
                    />
                  )}
                </ForecastDay>
              </Grid>
            ))}
          </Grid>
          
          {weatherData.metadata?.heatwaveAlert && (
            <Box 
              sx={{ 
                mt: 3, 
                p: 2, 
                bgcolor: theme.palette.error.light + '15',
                borderRadius: theme.shape.borderRadius,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <WarningIcon sx={{ color: theme.palette.error.main, mr: 1 }} />
              <Typography variant="body2" fontWeight={500}>
                Heatwave Alert: High temperatures expected in the coming days. Stay hydrated and avoid prolonged sun exposure.
              </Typography>
            </Box>
          )}
        </ForecastSection>
      )}
    </WeatherContainer>
  );
};

export default WeatherCard;

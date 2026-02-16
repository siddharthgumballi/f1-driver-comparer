// Official F1 team colors for constructor styling
// These colors are used for accents when displaying team-related information

export type TeamColor = {
  primary: string
  secondary: string
  text: string
}

// Official team colors based on constructor ID
const teamColors: Record<string, TeamColor> = {
  // Current teams (2024-2025 season)
  'red_bull': {
    primary: '#3671C6',
    secondary: '#1B2A4E',
    text: '#FFFFFF',
  },
  'ferrari': {
    primary: '#E80020',
    secondary: '#FFEB00',
    text: '#FFFFFF',
  },
  'mercedes': {
    primary: '#27F4D2',
    secondary: '#000000',
    text: '#000000',
  },
  'mclaren': {
    primary: '#FF8000',
    secondary: '#47C7FC',
    text: '#000000',
  },
  'aston_martin': {
    primary: '#229971',
    secondary: '#CEDC00',
    text: '#FFFFFF',
  },
  'alpine': {
    primary: '#FF87BC',
    secondary: '#0093CC',
    text: '#000000',
  },
  'williams': {
    primary: '#64C4FF',
    secondary: '#041E42',
    text: '#000000',
  },
  'rb': {
    primary: '#6692FF',
    secondary: '#1E5BC6',
    text: '#FFFFFF',
  },
  'racing_bulls': {
    primary: '#6692FF',
    secondary: '#1E5BC6',
    text: '#FFFFFF',
  },
  'alphatauri': {
    primary: '#6692FF',
    secondary: '#1E5BC6',
    text: '#FFFFFF',
  },
  'kick_sauber': {
    primary: '#52E252',
    secondary: '#000000',
    text: '#000000',
  },
  'sauber': {
    primary: '#52E252',
    secondary: '#000000',
    text: '#000000',
  },
  'alfa': {
    primary: '#C92D4B',
    secondary: '#FFFFFF',
    text: '#FFFFFF',
  },
  'haas': {
    primary: '#B6BABD',
    secondary: '#E10600',
    text: '#000000',
  },
  'audi': {
    primary: '#FF0000',
    secondary: '#000000',
    text: '#FFFFFF',
  },
  'cadillac': {
    primary: '#1E3264',
    secondary: '#C4A747',
    text: '#FFFFFF',
  },

  // Historic teams
  'lotus': {
    primary: '#FFB800',
    secondary: '#1A1A1A',
    text: '#000000',
  },
  'brabham': {
    primary: '#00A550',
    secondary: '#FFFFFF',
    text: '#FFFFFF',
  },
  'tyrrell': {
    primary: '#00247D',
    secondary: '#FFFFFF',
    text: '#FFFFFF',
  },
  'renault': {
    primary: '#FFF500',
    secondary: '#000000',
    text: '#000000',
  },
  'benetton': {
    primary: '#00A550',
    secondary: '#FFFFFF',
    text: '#FFFFFF',
  },
  'jordan': {
    primary: '#FFC72C',
    secondary: '#000000',
    text: '#000000',
  },
  'brawn': {
    primary: '#D4FF00',
    secondary: '#FFFFFF',
    text: '#000000',
  },
  'force_india': {
    primary: '#FF80C7',
    secondary: '#F596C8',
    text: '#000000',
  },
  'racing_point': {
    primary: '#F596C8',
    secondary: '#FFFFFF',
    text: '#000000',
  },
  'toro_rosso': {
    primary: '#469BFF',
    secondary: '#1E5BC6',
    text: '#FFFFFF',
  },
  'minardi': {
    primary: '#000000',
    secondary: '#FFC000',
    text: '#FFFFFF',
  },
  'ligier': {
    primary: '#1E41FF',
    secondary: '#FFFFFF',
    text: '#FFFFFF',
  },
  'arrows': {
    primary: '#FF6600',
    secondary: '#000000',
    text: '#FFFFFF',
  },
  'bar': {
    primary: '#FFFFFF',
    secondary: '#E32636',
    text: '#000000',
  },
  'honda': {
    primary: '#FFFFFF',
    secondary: '#E32636',
    text: '#000000',
  },
  'toyota': {
    primary: '#CC0000',
    secondary: '#FFFFFF',
    text: '#FFFFFF',
  },
  'jaguar': {
    primary: '#006633',
    secondary: '#FFFFFF',
    text: '#FFFFFF',
  },
  'stewart': {
    primary: '#FFFFFF',
    secondary: '#003399',
    text: '#000000',
  },
  'manor': {
    primary: '#ED1C24',
    secondary: '#000000',
    text: '#FFFFFF',
  },
  'marussia': {
    primary: '#ED1C24',
    secondary: '#000000',
    text: '#FFFFFF',
  },
  'caterham': {
    primary: '#006633',
    secondary: '#FFD700',
    text: '#FFFFFF',
  },
  'hrt': {
    primary: '#969696',
    secondary: '#000000',
    text: '#FFFFFF',
  },
  'virgin': {
    primary: '#CC0000',
    secondary: '#000000',
    text: '#FFFFFF',
  },
  'spyker': {
    primary: '#FF6600',
    secondary: '#000000',
    text: '#FFFFFF',
  },
  'super_aguri': {
    primary: '#FFFFFF',
    secondary: '#E32636',
    text: '#000000',
  },
  'surtees': {
    primary: '#FF0000',
    secondary: '#FFFFFF',
    text: '#FFFFFF',
  },
  'march': {
    primary: '#FF6600',
    secondary: '#000000',
    text: '#FFFFFF',
  },
  'prost': {
    primary: '#1E41FF',
    secondary: '#FFFFFF',
    text: '#FFFFFF',
  },
  'matra': {
    primary: '#1E41FF',
    secondary: '#FFFFFF',
    text: '#FFFFFF',
  },
  'lola': {
    primary: '#CC0000',
    secondary: '#FFFFFF',
    text: '#FFFFFF',
  },
  'wolf': {
    primary: '#000000',
    secondary: '#FFD700',
    text: '#FFFFFF',
  },
  'shadow': {
    primary: '#000000',
    secondary: '#FFD700',
    text: '#FFFFFF',
  },
  'cooper': {
    primary: '#003399',
    secondary: '#FFFFFF',
    text: '#FFFFFF',
  },
  'brm': {
    primary: '#003300',
    secondary: '#FFFFFF',
    text: '#FFFFFF',
  },
  'vanwall': {
    primary: '#003300',
    secondary: '#FFD700',
    text: '#FFFFFF',
  },
  'lancia': {
    primary: '#003399',
    secondary: '#FFFFFF',
    text: '#FFFFFF',
  },
  'maserati': {
    primary: '#CC0000',
    secondary: '#FFFFFF',
    text: '#FFFFFF',
  },
  'gordini': {
    primary: '#1E41FF',
    secondary: '#FFFFFF',
    text: '#FFFFFF',
  },
  'alfa_romeo': {
    primary: '#C92D4B',
    secondary: '#FFFFFF',
    text: '#FFFFFF',
  },
}

// Default color for unknown teams
const defaultColor: TeamColor = {
  primary: '#6B6B6B',
  secondary: '#2D2D2D',
  text: '#FFFFFF',
}

// Get team color by constructor ID
export function getTeamColor(constructorId: string | undefined): TeamColor {
  if (!constructorId) return defaultColor
  return teamColors[constructorId.toLowerCase()] || defaultColor
}

// Get CSS custom properties for a team
export function getTeamColorCss(constructorId: string | undefined): Record<string, string> {
  const colors = getTeamColor(constructorId)
  return {
    '--team-primary': colors.primary,
    '--team-secondary': colors.secondary,
    '--team-text': colors.text,
  }
}

// Get inline style object for team-colored elements
export function getTeamColorStyle(constructorId: string | undefined): React.CSSProperties {
  const colors = getTeamColor(constructorId)
  return {
    backgroundColor: colors.primary,
    color: colors.text,
    borderColor: colors.secondary,
  }
}

// Get gradient style for team colors
export function getTeamGradientStyle(constructorId: string | undefined): React.CSSProperties {
  const colors = getTeamColor(constructorId)
  return {
    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
  }
}

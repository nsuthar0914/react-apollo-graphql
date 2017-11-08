import getMuiTheme from 'material-ui/styles/getMuiTheme';
import {
  grey100, grey300, grey400, grey500,
  white,
} from 'material-ui/styles/colors';

const muiTheme = getMuiTheme({
  fontFamily: 'Helvetica,Arial,sans-serif',
  palette: {
    primary1Color: 'rgb(73, 184, 130)',
    primary2Color: 'rgba(73, 184, 130, 0.58)',
    primary3Color: grey400,
    accent1Color: 'rgb(0, 108, 209)',
    accent2Color: grey100,
    accent3Color: grey500,
    textColor: 'rgb(0, 56, 108)',
    alternateTextColor: white,
    canvasColor: white,
    borderColor: grey300,
  },
});

export default muiTheme;

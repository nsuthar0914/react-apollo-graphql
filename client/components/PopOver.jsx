import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';

export default class PopOver extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      open: false,
    };
  }

  handleTouchTap = (event) => {
    // This prevents ghost click.
    event.preventDefault();

    this.setState({
      open: true,
      anchorEl: event.currentTarget,
    });
  };

  handleRequestClose = () => {
    this.setState({
      open: false,
    });
  };

  render() {
    const { items, title } = this.props;
    return (
      <div>
        <RaisedButton
          onClick={this.handleTouchTap}
          label={title || 'Click for options'}
        />
        <Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
          targetOrigin={{horizontal: 'left', vertical: 'top'}}
          onRequestClose={this.handleRequestClose}
        >
          <Menu>
            {items.map((it, i) => {
              if (it.isDeleted) return null;
              return (<MenuItem
                key={`menuitem-${i}`}
                primaryText={it.text}
                onClick={() => window.open(it.url)}
              />);
            })}
          </Menu>
        </Popover>
      </div>
    );
  }
}

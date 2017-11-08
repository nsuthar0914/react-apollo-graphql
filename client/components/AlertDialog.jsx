import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import {checkEnterEscapeKeyPress} from '../utils.jsx';

const styles = {
  titleDanger: {
    color: 'red'
  }
}

class AlertDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      data: {},
    }
    this.handleKeyPress = this.handleKeyPress.bind(this);
  }
  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyPress);
  }
  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyPress);
  }
  handleKeyPress(e) {
    if (checkEnterEscapeKeyPress(e) && this.state.isOpen) {
      if (checkEnterEscapeKeyPress(e).isEscape) {
        this.closeDialog(false);
      } else if (checkEnterEscapeKeyPress(e).isEnter) {
        this.closeDialog(true);
      }
    }
  }
  openDialog(data) {
    this.setState({
      isOpen: true,
      data,
    });
  }
  closeDialog() {
    if (this.state.data.handleConfirm) {
      this.state.data.handleConfirm();
    } else if (this.props.handleConfirm) {
      this.props.handleConfirm();
    }
    this.setState({
      isOpen: false,
      data: {},
    });
  }
  render() {
    const { isOpen, data } = this.state;
    const { canContainHtml } = this.props;
    const message = data.message || 'Are you sure you want to proceed?';
    return (
      <Dialog
        title={data.title || 'Alert!'}
        titleStyle={data.important ? styles.titleDanger : null}
        modal={false}
        open={isOpen}
        onRequestClose={() => { this.closeDialog(); }}
        actions={[
          <FlatButton type='button' secondary={data.important} onClick={() => { this.closeDialog();}} label="Got It!"/>
        ]}
      >
        { canContainHtml ? (
          <div dangerouslySetInnerHTML={{ __html: message }}>
          </div> ) : (
          <div>
            {message}
          </div>
          )
        }
      </Dialog>
    );
  }

}

AlertDialog.propTypes = {
  handleConfirm: React.PropTypes.func,
}

export default AlertDialog;

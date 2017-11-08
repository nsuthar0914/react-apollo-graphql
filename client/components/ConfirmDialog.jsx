import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import {checkEnterEscapeKeyPress} from '../utils.jsx';

const styles = {
  titleDanger: {
    color: 'red'
  }
}


class ConfirmDialog extends React.Component {
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
  closeDialog(response) {
    if (response) {
      if (this.state.data.handleConfirm) {
        this.state.data.handleConfirm();
      } else {
        this.props.handleConfirm();
      }
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
        title={data.title || 'Please Confirm'}
        titleStyle={data.important ? styles.titleDanger : null}
        modal={false}
        open={isOpen}
        onRequestClose={() => { this.closeDialog(false); }}
        actions={[
          <FlatButton type='button' secondary={data.important} onClick={() => { this.closeDialog(true);}} label="Ok" />,
          <FlatButton type='button' onClick={() => { this.closeDialog(false); }} label="Cancel" />
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

ConfirmDialog.propTypes = {
  handleConfirm: React.PropTypes.func,
}

export default ConfirmDialog;

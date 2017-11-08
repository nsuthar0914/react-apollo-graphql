import React from 'react';
import Paper from 'material-ui/Paper';
import FlatButton from 'material-ui/FlatButton';
import {Link, browserHistory} from 'react-router';

const styles = {
  footerLogo: {
    margin: '10px 0',
    width: '33%',
  },
  navItemsCenter: {
    margin: '20px 0',
    width: '33%',
    textAlign: 'center',
  },
  navItems: {
    margin: '10px 20px',
  },
  navItemsRight: {
    margin: '20px 0',
    width: '33%',
  },
  footer: {
    position: 'relative',
    bottom: '0px',
    width: '100%',
    background: '#00386c',
    color: '#fff',
    textAlign: 'center',
  },
  flex: {
    display: 'flex',
  },
}

class Footer extends React.Component{
  constructor(props){
    super(props)
  }

  goTo(url) {
    browserHistory.push(url);
  }

  render(){
    return (
      <div className="bg-tertiary">
        <Paper style={styles.footer}>
          <div><p>© 2016 BadCanvas Services Pvt Ltd., All Rights Reserved</p></div>
          <div className="responsive-footer-internal">
            <div style={styles.footerLogo} onClick={() => this.goTo('/')} className="resposive-align-left-center">
              <img
                className="site-logo"
                src="https://media-exp2.licdn.com/mpr/mpr/shrink_200_200/AAEAAQAAAAAAAAZXAAAAJDk3OGMzNjY3LTE1MDgtNGQxNS1hNTM1LTU3MTZmNzE0YjA4OQ.png"
                alt="BadCanvas"
              />
            </div>
            <div style={styles.navItemsCenter} className="resposive-align">
            </div>
            <div style={styles.navItemsRight} className="resposive-align-right-center">
              <a href="https://www.facebook.com/badcanvas/" style={styles.navItems} target="_blank">Facebook</a>
              <a href="https://www.linkedin.com/company/10393213/" style={styles.navItems} target="_blank">LinkedIn</a>
            </div>
          </div>
        </Paper>
      </div>
    );
  }
}

export default Footer;
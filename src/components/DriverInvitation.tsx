import Icon from './Icon';
import { Art3D } from '../engine/Scene3D';
import '../styles/driving.css';

export default function DriverInvitation() {
  return <section className="road-invite" aria-labelledby="road-invite-title">
    <div className="road-invite-copy"><span className="road-kicker"><span />NEW DESTINATION · TEENS</span><h2 id="road-invite-title">Your next chapter.<br /><em>Your first set of keys.</em></h2><p>Meet the road before you drive it. Read a short story, make your choice, and learn the rules behind it.</p><div className="road-invite-tags"><span>120 story questions</span><span>California DMV practice</span><span>3D road scenes</span></div><a className="btn primary" href="#/driving"><Icon name="car" size={18} />Open Teen DMV Practice<Icon name="right" size={17} /></a></div>
    <div className="road-invite-art"><Art3D kind="dmv" data={{ scene: 2 }} zoom={11} /><span className="road-art-stamp">READ · THINK · DRIVE SMART</span></div>
  </section>;
}


import { Component } from "react";
import { getTopCounter, countUp, getTotalCount, getMyCount } from "../lib/stacks/counter";

export default class CounterWidget extends Component {
  state = {
    topCount: {
      who: '', count: 0,
    },
    totalCount: 0,
    myCount: 0,
    loading: true
  }

  async componentDidMount() {
    this.setState({
      topCount: await getTopCounter(),
      totalCount: await getTotalCount(),
      myCount: await getMyCount(),
      loading: false,
    });
  }

  async countUpButtonPressed() {
    await countUp(
      () => { alert('CANCELLED'); },
      (url: String) => { console.log(url) }
    );
  }

  render() {
    return (
      <div>
        {this.state.loading
          ? <span> Loading </span>
          : <div>
              <span>TOP COUNTER: {this.state.topCount.count}({this.state.topCount.who})</span>
              <span>TOTAL COUNT: {this.state.totalCount}</span>
              <span>MY COUNT: {this.state.myCount}</span>
              <button
                onClick={this.countUpButtonPressed}
              >
                COUNT UP!
              </button>
            </div>
        }
      </div>
    )
  }
}

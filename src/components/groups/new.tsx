import { Component } from "react";
import { createGroup } from "../../lib/stacks/group";

export default class NewGroupPage extends Component {
  state = {
    name: '', loading: false,
  }

  constructor(props: any) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event: any) {
    this.setState({ name: event.target.value });
  }

  handleSubmit(event: any) {
    event.preventDefault();
    if (this.state.loading) return;
    this.setState({...this.state, loading: true});
    createGroup(this.state.name, () => {}, (_) => {});
  }

  render() {
    return (
      <div>
        <header>
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">New group</h1>
          </div>
        </header>
        <main>
          <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              <div className="md:grid md:grid-cols-3 md:gap-6">
                <div className="md:col-span-1">
                  <div className="px-4 sm:px-0">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Group Information</h3>
                    <p className="mt-1 text-sm text-gray-600">Please input the following information to create a group.</p>
                    <p className="mt-1 text-sm text-gray-600">When the mainnet app is available, a 'btc' domain would be mandatory in order to create a group.</p>
                  </div>
                </div>
                <div className="mt-5 md:mt-0 md:col-span-2">
                  <form onSubmit={this.handleSubmit}>
                    <div className="overflow-hidden shadow sm:rounded-md">
                      <div className="px-4 py-5 bg-white sm:p-6">
                        <div className="grid grid-cols-6 gap-6">

                          <div className="col-span-6">
                            <label htmlFor="group-name" className="block text-sm font-medium text-gray-700">
                              Group name
                            </label>
                            <input
                              type="text"
                              name="group-name"
                              id="group-name"
                              value={this.state.name}
                              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              onChange={this.handleChange}
                              placeholder="Group name"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="px-4 py-3 text-right bg-gray-50 sm:px-6">
                        {this.state.loading
                          ?
                            <button type="button" className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" disabled>
                              <svg className="w-5 h-5 mr-3 animate-spin" viewBox="0 0 24 24" />
                              Creating
                            </button>
                          :
                            <button
                              type="submit"
                              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              Create
                            </button>

                        }
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <div className="hidden sm:block" aria-hidden="true">
              <div className="py-5">
                <div className="border-t border-gray-200" />
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }
}

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"

const AddUser = () => {
  return (
        <div>
            <Card x-chunk="dashboard-04-chunk-1">
              <CardHeader>
                <CardTitle>Create New User</CardTitle>
                <CardDescription>
                  Create a New User for the Saksham Dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent>
              <form>
                <div className="space-y-12 -mt-8">
                  <div className="border-b border-gray-900/10 pb-12">
                    <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                      <div className="sm:col-span-3">
                        <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900">Username</label>
                        <div className="mt-2">
                          <input type="text" name="username" id="username" autoComplete="username" className="block w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"/>
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">Password</label>
                        <div className="mt-2">
                          <input type="password" name="password" id="password" className="block w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"/>
                        </div>
                      </div>

                      <div className="sm:col-span-4">
                        <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">Email address</label>
                        <div className="mt-2">
                          <input id="email" name="email" type="email" autoComplete="email" className="block w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"/>
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="role" className="block text-sm font-medium leading-6 text-gray-900">Role</label>
                        <div className="mt-2">
                          <select id="role" name="role" autoComplete="role" className="block w-full rounded-md border-0 py-1.5 px-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6">
                            <option>User</option>
                            <option>Admin</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-b border-gray-900/10 pb-12">
                    <h2 className="text-base font-semibold leading-7 text-gray-900">Permisions</h2>
                    <p className="mt-1 text-sm leading-6 text-gray-600">These are the permisions for the account you are creating. Select them carefully!</p>
                    <div className="mt-10 space-y-10">
                      <fieldset>
                        <legend className="text-sm font-semibold leading-6 text-gray-900">Please select the permissions</legend>
                        <div className="mt-6 space-y-6">
                          <div className="relative flex gap-x-3">
                            <div className="flex h-6 items-center">
                              <input id="can_create" name="can_create" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"/>
                            </div>
                            <div className="text-sm leading-6">
                              <label htmlFor="can_create" className="font-medium text-gray-900">Can Create New FIR</label>
                              <p className="text-gray-500">Permission for the user to create a new FIR.</p>
                            </div>
                          </div>
                          <div className="relative flex gap-x-3">
                            <div className="flex h-6 items-center">
                              <input id="can_read" name="can_read" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"/>
                            </div>
                            <div className="text-sm leading-6">
                              <label htmlFor="can_read" className="font-medium text-gray-900">Can Read FIR</label>
                              <p className="text-gray-500">Permission for the user to read the FIR.</p>
                            </div>
                          </div>
                          <div className="relative flex gap-x-3">
                            <div className="flex h-6 items-center">
                              <input id="can_update" name="can_update" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"/>
                            </div>
                            <div className="text-sm leading-6">
                              <label htmlFor="can_update" className="font-medium text-gray-900">Can Update/Modify a Existing FIR</label>
                              <p className="text-gray-500">Permission for the user to update/modify the FIR</p>
                            </div>
                          </div>
                          <div className="relative flex gap-x-3">
                            <div className="flex h-6 items-center">
                              <input id="can_delete" name="can_delete" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"/>
                            </div>
                            <div className="text-sm leading-6">
                              <label htmlFor="can_delete" className="font-medium text-gray-900">Can Delete a FIR</label>
                              <p className="text-gray-500">Permission for the user to delete a fir</p>
                            </div>
                          </div>
                        </div>
                      </fieldset>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-end gap-x-6">
                  <button type="button" className="text-sm font-semibold leading-6 text-gray-900">Cancel</button>
                  <button type="submit" className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Create User</button>
                </div>
              </form>
              </CardContent>
            </Card>
        </div>
  )
}

export default AddUser

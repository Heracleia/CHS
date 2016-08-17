using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices.WindowsRuntime;
using Windows.Foundation;
using Windows.Foundation.Collections;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Controls.Primitives;
using Windows.UI.Xaml.Data;
using Windows.UI.Xaml.Input;
using Windows.UI.Xaml.Media;
using Windows.UI.Xaml.Navigation;
using Quobject.SocketIoClientDotNet.Client;

// The Blank Page item template is documented at http://go.microsoft.com/fwlink/?LinkId=234238

namespace vs
{
    /// <summary>
    /// An empty page that can be used on its own or navigated to within a Frame.
    /// </summary>
    public sealed partial class MainPage : Page
    {
        bool recording;

        public MainPage()
        {
            this.InitializeComponent();
            var socket = IO.Socket("http://localhost:3000");
            socket.On(Socket.EVENT_CONNECT, async () =>
            {
                await Windows.ApplicationModel.Core.CoreApplication.MainView.Dispatcher.RunAsync(Windows.UI.Core.CoreDispatcherPriority.Normal, () => {
                    textBox.Text = "Connected to localhost:3000";
                });
            });

            socket.On("recordStart", async () =>
            {
                await Windows.ApplicationModel.Core.CoreApplication.MainView.Dispatcher.RunAsync(Windows.UI.Core.CoreDispatcherPriority.Normal, () => {
                    record();
                });
            });

            socket.On("recordCancel", async () =>
            {
                await Windows.ApplicationModel.Core.CoreApplication.MainView.Dispatcher.RunAsync(Windows.UI.Core.CoreDispatcherPriority.Normal, () => {
                    cancel();
                });
            });

            socket.On("recordComplete", async () =>
            {
                await Windows.ApplicationModel.Core.CoreApplication.MainView.Dispatcher.RunAsync(Windows.UI.Core.CoreDispatcherPriority.Normal, () => {
                    complete();
                });
            });
        }

        void record()
        {
            textBox.Text = "Recording...";
            recording = true;
        }

        void cancel()
        {
            textBox.Text = "Recording canceled";
            recording = false;
        }

        void complete()
        {
            textBox.Text = "Recording complete";
            recording = false;
        }
    }
}
